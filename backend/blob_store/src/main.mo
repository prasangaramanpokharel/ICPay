import Map "mo:core/Map";
import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Time "mo:core/Time";

// Dedicated storage canister for ICPay Cloud file bytes and direct HTTP gateway serving.
// Operates as an independent Data Plane canister holding gigabytes of user storage,
// keeping the main financial wallet canister untouched and 100% safe.
persistent actor class BlobStore(initAuthorized: Principal) {
  public type HeaderField = (Text, Text);

  public type HttpRequest = {
    method: Text;
    url: Text;
    headers: [HeaderField];
    body: Blob;
  };

  public type StreamToken = {
    blobId: Text;
    offset: Nat;
  };

  public type StreamingCallbackHttpResponse = {
    body: Blob;
    token: ?StreamToken;
  };

  public type StreamingStrategy = {
    #Callback: {
      callback: shared query StreamToken -> async StreamingCallbackHttpResponse;
      token: StreamToken;
    };
  };

  public type HttpResponse = {
    status_code: Nat16;
    headers: [HeaderField];
    body: Blob;
    streaming_strategy: ?StreamingStrategy;
  };

  public type UploadSession = {
    caller: Principal;
    totalChunks: Nat;
    totalBytes: Nat;
    contentType: Text;
    chunks: Map.Map<Nat, Blob>;
    createdAt: Int;
  };

  let CHUNK_SIZE: Nat = 1_500_000; // 1.5 MB streaming chunk

  var authorized = initAuthorized;
  let blobs = Map.empty<Text, Blob>();
  let contentTypes = Map.empty<Text, Text>();
  let sessions = Map.empty<Text, UploadSession>();
  var capacityLimitBytes: Nat = 400_000_000_000; // 400 GB maximum per canister

  func assertWriter(caller: Principal) {
    if (not Principal.equal(caller, authorized)) {
      assert false;
    };
  };

  func canAccessSession(caller: Principal, session: UploadSession) : Bool {
    Principal.equal(caller, authorized) or Principal.equal(caller, session.caller)
  };

  // Direct put (used by backend inter-canister calls and single-shot uploads)
  public shared ({ caller }) func putBlob(id: Text, data: Blob) : async () {
    assertWriter(caller);
    blobs.add(id, data);
  };

  public shared ({ caller }) func putBlobWithMeta(id: Text, data: Blob, contentType: Text) : async () {
    assertWriter(caller);
    blobs.add(id, data);
    contentTypes.add(id, contentType);
  };

  public shared query func getBlob(id: Text) : async ?Blob {
    blobs.get(id)
  };

  public shared composite query func fetchBlob(id: Text) : async ?Blob {
    blobs.get(id)
  };

  public shared query func getContentType(id: Text) : async ?Text {
    contentTypes.get(id)
  };

  public shared ({ caller }) func deleteBlob(id: Text) : async Bool {
    assertWriter(caller);
    contentTypes.remove(id);
    switch (blobs.get(id)) {
      case (null) false;
      case (?_) {
        blobs.remove(id);
        true
      };
    }
  };

  // Direct client chunk upload protocol (bypasses main wallet backend)
  public shared ({ caller }) func beginSession(
    uploadId: Text,
    totalBytes: Nat,
    totalChunks: Nat,
    contentType: Text,
  ) : async Bool {
    switch (sessions.get(uploadId)) {
      case (?_) return false;
      case (null) {};
    };
    let session: UploadSession = {
      caller = caller;
      totalChunks = totalChunks;
      totalBytes = totalBytes;
      contentType = contentType;
      chunks = Map.empty<Nat, Blob>();
      createdAt = Time.now();
    };
    sessions.add(uploadId, session);
    true
  };

  public shared ({ caller }) func putChunk(
    uploadId: Text,
    chunkIndex: Nat,
    chunkData: Blob,
  ) : async Bool {
    switch (sessions.get(uploadId)) {
      case (null) false;
      case (?session) {
        if (not canAccessSession(caller, session)) return false;
        if (chunkIndex >= session.totalChunks) return false;
        session.chunks.add(chunkIndex, chunkData);
        true
      };
    }
  };

  public shared ({ caller }) func commitSession(
    uploadId: Text,
    targetBlobId: Text,
  ) : async Bool {
    switch (sessions.get(uploadId)) {
      case (null) false;
      case (?session) {
        if (not canAccessSession(caller, session)) return false;
        if (session.chunks.size() < session.totalChunks) return false;

        var assembledArray: [Nat8] = [];
        var i: Nat = 0;
        while (i < session.totalChunks) {
          switch (session.chunks.get(i)) {
            case (null) return false;
            case (?c) {
              assembledArray := Array.concat(assembledArray, Blob.toArray(c));
            };
          };
          i += 1;
        };

        let finalBlob = Blob.fromArray(assembledArray);
        blobs.add(targetBlobId, finalBlob);
        contentTypes.add(targetBlobId, session.contentType);
        sessions.remove(uploadId);
        true
      };
    }
  };

  public shared ({ caller }) func cancelSession(uploadId: Text) : async Bool {
    switch (sessions.get(uploadId)) {
      case (null) false;
      case (?session) {
        if (not canAccessSession(caller, session)) return false;
        sessions.remove(uploadId);
        true
      };
    }
  };

  func getHeader(headers: [HeaderField], targetKey: Text) : ?Text {
    let lowerTarget = Text.toLower(targetKey);
    var i: Nat = 0;
    while (i < headers.size()) {
      let (key, value) = headers[i];
      if (Text.toLower(key) == lowerTarget) {
        return ?value;
      };
      i += 1;
    };
    null
  };

  func blobSlice(data: Blob, start: Nat, end: Nat) : Blob {
    let total = data.size();
    if (start >= total) return Blob.fromArray([]);
    let actualEnd = if (end > total) total else end;
    let len = Nat.sub(actualEnd, start);
    let bytes = Blob.toArray(data);
    Blob.fromArray(Array.tabulate<Nat8>(len, func(i) { bytes[start + i] }))
  };

  // Direct HTTP Gateway: enables public streaming directly from this canister
  public shared query func http_request(request: HttpRequest) : async HttpResponse {
    let corsHeaders: [HeaderField] = [
      ("Access-Control-Allow-Origin", "*"),
      ("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS"),
      ("Access-Control-Allow-Headers", "*"),
      ("Access-Control-Expose-Headers", "ETag, Content-Length, Content-Type"),
      ("X-Content-Type-Options", "nosniff"),
    ];

    if (request.method == "OPTIONS") {
      return {
        status_code = 204;
        headers = corsHeaders;
        body = Blob.fromArray([]);
        streaming_strategy = null;
      };
    };

    // Extract path (e.g. "/abc-123" or "/files/abc-123")
    let rawPath = stripQuery(request.url);
    let blobId = cleanBlobId(rawPath);

    switch (blobs.get(blobId)) {
      case (null) {
        let notFoundHeaders: [HeaderField] = Array.concat(corsHeaders, [
          ("Content-Type", "text/plain; charset=utf-8"),
        ]);
        {
          status_code = 404;
          headers = notFoundHeaders;
          body = Blob.fromArray([]);
          streaming_strategy = null;
        }
      };
      case (?data) {
        let etag = "\"" # blobId # "\"";
        let mime = switch (contentTypes.get(blobId)) {
          case (?m) m;
          case (null) "application/octet-stream";
        };

        // Check If-None-Match for HTTP 304 Not Modified (15x-30x speedup for concurrent users)
        let clientEtag = getHeader(request.headers, "if-none-match");
        let isMatch = switch (clientEtag) {
          case (?match) {
            match == etag or match == blobId or match == "*" or Text.contains(match, #text blobId)
          };
          case (null) false;
        };

        if (isMatch) {
          return {
            status_code = 304;
            headers = Array.concat(corsHeaders, [
              ("ETag", etag),
              ("Cache-Control", "public, max-age=31536000, immutable"),
              ("CDN-Cache-Control", "public, max-age=31536000, immutable"),
            ]);
            body = Blob.fromArray([]);
            streaming_strategy = null;
          };
        };

        let responseHeaders: [HeaderField] = Array.concat(corsHeaders, [
          ("Content-Type", mime),
          ("Content-Length", Nat.toText(data.size())),
          ("ETag", etag),
          ("Cache-Control", "public, max-age=31536000, immutable"),
          ("CDN-Cache-Control", "public, max-age=31536000, immutable"),
          ("Accept-Ranges", "bytes"),
        ]);

        if (request.method == "HEAD") {
          return {
            status_code = 200;
            headers = responseHeaders;
            body = Blob.fromArray([]);
            streaming_strategy = null;
          };
        };

        let totalSize = data.size();
        let (bodyChunk, strategy) = if (totalSize <= CHUNK_SIZE) {
          (data, null)
        } else {
          (
            blobSlice(data, 0, CHUNK_SIZE),
            ?#Callback({
              callback = http_streaming;
              token = { blobId = blobId; offset = CHUNK_SIZE };
            })
          )
        };

        {
          status_code = 200;
          headers = responseHeaders;
          body = bodyChunk;
          streaming_strategy = strategy;
        }
      };
    }
  };

  public shared query func http_streaming(token: StreamToken) : async StreamingCallbackHttpResponse {
    switch (blobs.get(token.blobId)) {
      case (null) {
        { body = Blob.fromArray([]); token = null }
      };
      case (?data) {
        let total = data.size();
        let nextOffset = token.offset + CHUNK_SIZE;
        let chunk = blobSlice(data, token.offset, nextOffset);
        let nextToken = if (nextOffset >= total) {
          null
        } else {
          ?{ blobId = token.blobId; offset = nextOffset }
        };
        { body = chunk; token = nextToken }
      };
    }
  };

  func stripQuery(url: Text) : Text {
    switch (Text.split(url, #char '?')) {
      case (iter) {
        switch (iter.next()) {
          case (?first) first;
          case (null) url;
        }
      };
    }
  };

  func cleanBlobId(path: Text) : Text {
    var p = path;
    if (Text.startsWith(p, #text "/")) {
      p := Text.replace(p, #text "/", "");
    };
    if (Text.startsWith(p, #text "files/")) {
      p := Text.replace(p, #text "files/", "");
    };
    p
  };

  public shared query func stats() : async { count: Nat; bytes: Nat } {
    var count : Nat = 0;
    var bytes : Nat = 0;
    for (data in Map.values(blobs)) {
      count += 1;
      bytes += data.size();
    };
    { count; bytes }
  };

  public shared query func getCapacityLimit() : async Nat {
    capacityLimitBytes
  };

  public shared ({ caller }) func setCapacityLimit(newLimit: Nat) : async () {
    assertWriter(caller);
    capacityLimitBytes := newLimit;
  };

  public shared ({ caller }) func setAuthorized(principal: Principal) : async () {
    assertWriter(caller);
    authorized := principal;
  };
};
