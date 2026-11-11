import Principal "mo:core/Principal";
import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import Nat64 "mo:core/Nat64";
import Int "mo:core/Int";
import VarArray "mo:core/VarArray";
import Config "../config/Config";
import Sha256 "Sha256";

// Per-bucket encryption at rest. Derives a 256-bit key once, then XORs the
// plaintext in one pass — uses native 64-bit integer arithmetic and unboxed byte
// operations to stay well within the IC 40B instruction limit even on 25 MB files.
module {

  private let FP_SEED_64 : Nat64 = 5381;
  private let FINGERPRINT_PREFIX = "fp:";

  public func deriveKey(owner: Principal, bucketId: Text) : [Nat8] {
    let material = Principal.toText(owner) # ":" # bucketId # ":" # Config.BUCKET_CRYPTO_SALT;
    Sha256.sha256(Blob.toArray(Text.encodeUtf8(material)))
  };

  public type SealedBlob = {
    ciphertext: Blob;
    fingerprint: Text;
  };

  public func seal(plaintext: Blob, key: [Nat8]) : SealedBlob {
    sealFromChunks([plaintext], key)
  };

  // Encrypt + fingerprint in one efficient pass over ordered chunks — writes directly
  // into a single pre-allocated contiguous buffer (zero boxed [Nat8] heap copies).
  public func sealFromChunks(chunks: [Blob], key: [Nat8]) : SealedBlob {
    if (chunks.size() == 0) {
      return { ciphertext = Blob.fromArray([]); fingerprint = fingerprintText(FP_SEED_64, 0) };
    };
    var totalSize : Nat = 0;
    for (chunk in chunks.vals()) { totalSize += chunk.size() };
    if (totalSize == 0) {
      return { ciphertext = Blob.fromArray([]); fingerprint = fingerprintText(FP_SEED_64, 0) };
    };
    let buffer = VarArray.repeat<Nat8>(0, totalSize);
    let keyLen = key.size();
    var hash : Nat64 = FP_SEED_64;
    var destOffset : Nat = 0;
    for (chunk in chunks.vals()) {
      let src = Blob.toVarArray(chunk);
      let n = src.size();
      var j = 0;
      if (keyLen == 0) {
        while (j < n) {
          let plain = src[j];
          hash := hash *% 33 +% Nat8.toNat64(plain);
          buffer[destOffset + j] := plain;
          j += 1;
        };
      } else {
        while (j < n) {
          let plain = src[j];
          hash := hash *% 33 +% Nat8.toNat64(plain);
          buffer[destOffset + j] := plain ^ key[(destOffset + j) % keyLen];
          j += 1;
        };
      };
      destOffset += n;
    };
    {
      ciphertext = Blob.fromVarArray(buffer);
      fingerprint = fingerprintText(hash, totalSize);
    }
  };

  public func open(ciphertext: Blob, key: [Nat8], expected: Text) : ?Blob {
    if (not Text.startsWith(expected, #text FINGERPRINT_PREFIX)) {
      return null;
    };
    let bytes = Blob.toVarArray(ciphertext);
    let n = bytes.size();
    let keyLen = key.size();
    if (n == 0 or keyLen == 0) {
      if (expected == fingerprintText(FP_SEED_64, 0)) {
        return ?ciphertext;
      };
      return null;
    };
    var hash : Nat64 = FP_SEED_64;
    var i = 0;
    while (i < n) {
      let plain = bytes[i] ^ key[i % keyLen];
      hash := hash *% 33 +% Nat8.toNat64(plain);
      bytes[i] := plain;
      i += 1;
    };
    if (fingerprintText(hash, n) != expected) return null;
    ?Blob.fromVarArray(bytes)
  };

  public func encrypt(plaintext: Blob, key: [Nat8]) : Blob {
    seal(plaintext, key).ciphertext
  };

  public func decrypt(ciphertext: Blob, key: [Nat8]) : Blob {
    let bytes = Blob.toVarArray(ciphertext);
    let n = bytes.size();
    let keyLen = key.size();
    if (n == 0 or keyLen == 0) return ciphertext;
    var i = 0;
    while (i < n) {
      bytes[i] := bytes[i] ^ key[i % keyLen];
      i += 1;
    };
    Blob.fromVarArray(bytes)
  };

  // XOR decrypts a pre-sliced chunk whose first byte is at position `fileOffset` in the overall file.
  public func decryptChunk(encChunk: Blob, key: [Nat8], fileOffset: Nat) : Blob {
    let keyLen = key.size();
    if (keyLen == 0) return encChunk;
    let bytes = Blob.toVarArray(encChunk);
    let n = bytes.size();
    if (n == 0) return encChunk;
    var i = 0;
    while (i < n) {
      let filePos = fileOffset + i;
      bytes[i] := bytes[i] ^ key[filePos % keyLen];
      i += 1;
    };
    Blob.fromVarArray(bytes)
  };

  // XOR decrypt a byte range only — used for HTTP streaming without loading the full file.
  public func decryptSlice(ciphertext: Blob, key: [Nat8], offset: Nat, limit: Nat) : Blob {
    let keyLen = key.size();
    if (keyLen == 0) return Blob.fromArray([]);
    let bytes = Blob.toVarArray(ciphertext);
    let n = bytes.size();
    if (offset >= n) return Blob.fromArray([]);
    let end = if (offset + limit > n) { n } else { offset + limit };
    let lenInt = Int.sub(Int.fromNat(end), Int.fromNat(offset));
    if (lenInt <= 0) return Blob.fromArray([]);
    let len = Int.toNat(lenInt);
    if (len == 0) return Blob.fromArray([]);
    let sliceBuf = VarArray.repeat<Nat8>(0, len);
    var i = 0;
    while (i < len) {
      let pos = offset + i;
      sliceBuf[i] := bytes[pos] ^ key[pos % keyLen];
      i += 1;
    };
    Blob.fromVarArray(sliceBuf)
  };

  public func isFastFingerprint(checksum: Text) : Bool {
    Text.startsWith(checksum, #text FINGERPRINT_PREFIX)
  };

  private func fingerprintText(hash: Nat64, size: Nat) : Text {
    FINGERPRINT_PREFIX # Nat64.toText(hash) # ":" # Nat.toText(size)
  };

};
