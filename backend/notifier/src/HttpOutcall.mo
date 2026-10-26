import Text "mo:core/Text";
import Blob "mo:core/Blob";
import Nat "mo:core/Nat";
import Nat64 "mo:core/Nat64";
import Cycles "mo:core/Cycles";
import Error "mo:core/Error";
import Types "./Types";

module {
  let ic : Types.ManagementCanister = actor("aaaaa-aa");

  // Cycle cost calculation for 13-node subnet:
  // Base 49_140_000 + 5_200 * req_bytes + 10_400 * resp_bytes
  public func estimateCycles(reqBytes: Nat, maxRespBytes: Nat) : Nat {
    let base = 49_140_000;
    let reqCost = 5_200 * reqBytes;
    let respCost = 10_400 * maxRespBytes;
    base + reqCost + respCost + 10_000_000 // 10M buffer for protocol safety
  };

  public func sendResendEmail(
    apiKey: Text,
    fromEmail: Text,
    toEmail: Text,
    subject: Text,
    htmlBody: Text,
    transformCallback: ?(shared query { response: Types.CanisterHttpResponse; context: Blob } -> async Types.CanisterHttpResponse)
  ) : async { #ok: Nat; #err: Text } {
    if (Text.equal(apiKey, "")) {
      return #err("Email API key not configured");
    };

    let escapedSubject = escapeJson(subject);
    let escapedHtml = escapeJson(htmlBody);

    let jsonString = "{\"from\":\"" # fromEmail # "\",\"to\":[\"" # toEmail # "\"],\"subject\":\"" # escapedSubject # "\",\"html\":\"" # escapedHtml # "\"}";

    let bodyBlob = Text.encodeUtf8(jsonString);
    let reqBytes = Blob.size(bodyBlob);
    let maxRespBytes : Nat64 = 2048;
    let cycleFee = estimateCycles(reqBytes, Nat64.toNat(maxRespBytes));

    let headers : [Types.HttpHeader] = [
      { name = "Content-Type"; value = "application/json" },
      { name = "Authorization"; value = "Bearer " # apiKey },
      { name = "User-Agent"; value = "ICPay-Notifier/1.0" }
    ];

    let request : Types.CanisterHttpRequest = {
      url = "https://api.resend.com/emails";
      max_response_bytes = ?maxRespBytes;
      method = #post;
      headers = headers;
      body = ?bodyBlob;
      transform = switch (transformCallback) {
        case (null) null;
        case (?cb) ?{ function = cb; context = "" };
      };
    };

    try {
      let response = await (with cycles = cycleFee) ic.http_request(request);
      if (response.status >= 200 and response.status < 300) {
        #ok(response.status)
      } else {
        #err("Resend HTTP error status: " # Nat.toText(response.status))
      }
    } catch (e) {
      #err("HTTP outcall failed: " # Error.message(e))
    }
  };

  func escapeJson(t: Text) : Text {
    // Basic JSON string escaping for quotes, newlines, and backslashes
    var res = "";
    for (char in t.chars()) {
      if (char == '\"') {
        res := res # "\\\"";
      } else if (char == '\\') {
        res := res # "\\\\";
      } else if (char == '\n') {
        res := res # "\\n";
      } else if (char == '\r') {
        res := res # "\\r";
      } else if (char == '\t') {
        res := res # "\\t";
      } else {
        res := res # Text.fromChar(char);
      };
    };
    res
  };
};
