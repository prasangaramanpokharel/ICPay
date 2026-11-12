import Blob "mo:core/Blob";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import VarArray "mo:core/VarArray";

/// Blob helpers — prefer Blob over [Nat8] for binary data (4× more compact, less GC).
module {
  /** Join two blobs without an intermediate chunk list. */
  public func join(left : Blob, right : Blob) : Blob {
    if (left.size() == 0) return right;
    if (right.size() == 0) return left;
    concat([left, right])
  };

  /** Assemble chunked ingress payloads into one blob without boxed [Nat8] arrays. */
  public func concat(chunks : [Blob]) : Blob {
    if (chunks.size() == 0) return Blob.fromArray([]);
    if (chunks.size() == 1) return chunks[0];
    var total : Nat = 0;
    for (c in chunks.vals()) { total += c.size() };
    if (total == 0) return Blob.fromArray([]);
    let buffer = VarArray.repeat<Nat8>(0, total);
    var offset : Nat = 0;
    for (c in chunks.vals()) {
      let src = Blob.toVarArray(c);
      let n = src.size();
      var j = 0;
      while (j < n) {
        buffer[offset + j] := src[j];
        j += 1;
      };
      offset += n;
    };
    Blob.fromVarArray(buffer)
  };
};
