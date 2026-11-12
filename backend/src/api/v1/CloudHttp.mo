import Blob "mo:core/Blob";
import HttpTypes "../../http/Types";
import CloudHttpService "../../services/CloudHttpService";
import BucketService "../../services/BucketService";
import BucketRepository "../../repositories/BucketRepository";
import BucketCrypto "../../utils/BucketCrypto";
import Config "../../config/Config";

mixin (buckets: BucketService.BucketService) {

  public shared composite query func http_request(request: HttpTypes.HttpRequest) : async HttpTypes.HttpResponse {
    switch (request.method) {
      case ("OPTIONS") { CloudHttpService.handleOptions() };
      case ("GET") { await httpGet(request) };
      case ("HEAD") { await httpHead(request) };
      case (_) { CloudHttpService.emptyResponse(405) };
    }
  };

  public shared composite query func http_request_streaming_callback(
    token: HttpTypes.StreamToken,
  ) : async HttpTypes.StreamingCallbackHttpResponse {
    let file = switch (BucketRepository.getFileByPath(buckets.store, token.bucketId, token.path)) {
      case (null) { return { body = Blob.fromArray([]); token = null } };
      case (?f) f;
    };
    let bucket = switch (BucketRepository.get(buckets.store, token.bucketId)) {
      case (null) { return { body = Blob.fromArray([]); token = null } };
      case (?b) b;
    };
    switch (buckets.remoteBlobActor) {
      case (?remote) {
        let chunkLimit = Config.HTTP_CHUNK_BYTES;
        switch (await remote.fetchBlobSlice(file.id, token.offset, chunkLimit)) {
          case (null) { { body = Blob.fromArray([]); token = null } };
          case (?encSlice) {
            let key = BucketCrypto.deriveKey(bucket.owner, token.bucketId);
            let decrypted = BucketCrypto.decryptChunk(encSlice, key, token.offset);
            let next = token.offset + decrypted.size();
            let nextToken = if (next >= file.size) {
              null
            } else {
              ?{
                bucketId = token.bucketId;
                path = token.path;
                offset = next;
              }
            };
            { body = decrypted; token = nextToken }
          };
        }
      };
      case null {
        { body = Blob.fromArray([]); token = null }
      };
    }
  };

  public shared composite query func httpGet(request: HttpTypes.HttpRequest) : async HttpTypes.HttpResponse {
    switch (await buildHttpResponse(request.url)) {
      case (#err(resp)) resp;
      case (#ok(resp)) resp;
    }
  };

  public shared composite query func httpHead(request: HttpTypes.HttpRequest) : async HttpTypes.HttpResponse {
    switch (await buildHttpResponse(request.url)) {
      case (#err(resp)) { stripBody(resp) };
      case (#ok(resp)) { stripBody(resp) };
    }
  };

  public shared composite query func buildHttpResponse(url: Text) : async {
    #err: HttpTypes.HttpResponse;
    #ok: HttpTypes.HttpResponse;
  } {
    let path = CloudHttpService.stripQuery(url);
    if (path == "/.well-known/ic-domains") {
      return #ok(CloudHttpService.textResponse(200, "text/plain", "cloud.icpay.app\n"));
    };
    switch (CloudHttpService.parseCloudPath(path)) {
      case (null) { #err(CloudHttpService.textResponse(404, "text/plain", "Not found")) };
      case (?parsed) {
        let bucketId = switch (BucketService.resolveBucketId(buckets, parsed.bucketSegment)) {
          case (null) {
            return #err(CloudHttpService.textResponse(404, "text/plain", "Bucket not found"))
          };
          case (?id) id;
        };
        let file = switch (BucketRepository.getFileByPath(buckets.store, bucketId, parsed.path)) {
          case (null) {
            return #err(CloudHttpService.textResponse(404, "text/plain", "File not found"))
          };
          case (?f) f;
        };
        let bucket = switch (BucketRepository.get(buckets.store, bucketId)) {
          case (null) {
            return #err(CloudHttpService.textResponse(404, "text/plain", "Bucket not found"))
          };
          case (?b) b;
        };

        let totalSize = file.size;
        let firstLimit = if (totalSize <= Config.HTTP_MAX_BODY_BYTES) totalSize else Config.HTTP_CHUNK_BYTES;

        switch (buckets.remoteBlobActor) {
          case (?remote) {
            switch (await remote.fetchBlobSlice(file.id, 0, firstLimit)) {
              case (null) {
                #err(CloudHttpService.textResponse(404, "text/plain", "File not found"))
              };
              case (?encSlice) {
                let key = BucketCrypto.deriveKey(bucket.owner, bucketId);
                let decrypted = BucketCrypto.decryptChunk(encSlice, key, 0);
                if (totalSize <= Config.HTTP_MAX_BODY_BYTES) {
                  #ok(CloudHttpService.buildDirectResponse(file.contentType, decrypted))
                } else {
                  #ok(
                    CloudHttpService.buildStreamResponse(
                      file.contentType,
                      bucketId,
                      parsed.path,
                      decrypted,
                      totalSize,
                      http_request_streaming_callback,
                    )
                  )
                }
              };
            }
          };
          case null {
            #err(CloudHttpService.textResponse(500, "text/plain", "Blob store not configured"))
          };
        }
      };
    }
  };

  func stripBody(response: HttpTypes.HttpResponse) : HttpTypes.HttpResponse {
    {
      status_code = response.status_code;
      headers = response.headers;
      body = Blob.fromArray([]);
      streaming_strategy = null;
    }
  };

};
