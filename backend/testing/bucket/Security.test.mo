import Debug "mo:core/Debug";
import Blob "mo:core/Blob";
import FileValidator "../../src/utils/FileValidator";
import Fixtures "../bucket/Fixtures";

let fake = Blob.fromArray([0x00, 0x00, 0x00, 0x00]);

assert FileValidator.validateWebpHeader(Fixtures.webp());
assert FileValidator.validatePngHeader(Fixtures.png());
assert not FileValidator.validateWebpHeader(Fixtures.png());
Debug.print("PASS: image magic byte gates");

switch (FileValidator.normalizeUpload("/logo.webp", "image/webp", Fixtures.webp())) {
  case (?ct) {
    assert ct == "image/webp";
    Debug.print("PASS: webp normalize");
  };
  case (null) { assert false; Debug.print("FAIL: webp normalize") };
};

switch (FileValidator.normalizeUpload("/screenshot.png", "image/png", Fixtures.png())) {
  case (?ct) {
    assert ct == "image/png";
    Debug.print("PASS: png normalize");
  };
  case (null) { assert false; Debug.print("FAIL: png normalize") };
};

switch (FileValidator.normalizeUpload("/clip.mp4", "video/mp4", fake)) {
  case (?_) { assert false; Debug.print("FAIL: mp4 accepted") };
  case (null) { Debug.print("PASS: mp4 blocked") };
};

switch (FileValidator.normalizeUpload("/page.html", "text/html", Blob.fromArray([0x3C]))) {
  case (?_) { assert false; Debug.print("FAIL: html accepted") };
  case (null) { Debug.print("PASS: html blocked") };
};

switch (FileValidator.normalizeUpload("/install.exe", "application/octet-stream", fake)) {
  case (?_) { assert false; Debug.print("FAIL: exe accepted") };
  case (null) { Debug.print("PASS: exe blocked") };
};

switch (FileValidator.normalizeUpload("/deploy.sh", "text/x-sh", Blob.fromArray([0x23]))) {
  case (?_) { assert false; Debug.print("FAIL: sh accepted") };
  case (null) { Debug.print("PASS: sh blocked") };
};

switch (FileValidator.normalizeUpload("/secret.pem", "text/plain", Blob.fromArray([0x2D]))) {
  case (?_) { assert false; Debug.print("FAIL: pem accepted") };
  case (null) { Debug.print("PASS: pem blocked") };
};

switch (FileValidator.normalizeUpload("/app.js", "text/javascript", Blob.fromArray([0x7B]))) {
  case (?ct) {
    assert ct == "text/plain; charset=utf-8";
    Debug.print("PASS: js served safely as text/plain; charset=utf-8");
  };
  case (null) { assert false; Debug.print("FAIL: js rejected") };
};

switch (FileValidator.normalizeUpload("/Main.mo", "text/plain", Blob.fromArray([0x69]))) {
  case (?ct) {
    assert ct == "text/plain; charset=utf-8";
    Debug.print("PASS: mo normalize");
  };
  case (null) { assert false; Debug.print("FAIL: mo normalize") };
};

switch (FileValidator.normalizeUpload("/raw.svg", "image/svg+xml", Blob.fromArray([0x3C]))) {
  case (?_) { assert false; Debug.print("FAIL: svg accepted on backend") };
  case (null) { Debug.print("PASS: raw svg blocked on backend") };
};

switch (FileValidator.normalizeUpload("/notes.txt", "text/plain", Blob.fromArray([0x68, 0x69]))) {
  case (?ct) {
    assert ct == "text/plain; charset=utf-8";
    Debug.print("PASS: txt normalize");
  };
  case (null) { assert false; Debug.print("FAIL: txt normalize") };
};

assert FileValidator.validateFileSize(10_000_000);
assert not FileValidator.validateFileSize(10_000_001);
assert FileValidator.validateFileSizeForPath("/doc.pdf", 10_000_000);
assert not FileValidator.validateFileSizeForPath("/doc.pdf", 10_000_001);
Debug.print("PASS: size gate 10 MB general");

Debug.print("Bucket security validation tests done");
