import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { run, step } from "../lib.ts"

const academyDir = resolve(dirname(fileURLToPath(import.meta.url)), "../../backend/rust/academy")

if (!process.env.SDKROOT && process.platform === "darwin") {
  process.env.SDKROOT = "/Library/Developer/CommandLineTools/SDKs/MacOSX15.4.sdk"
}

step("ACADEMY BUILD")
run("cargo", ["build", "--target", "wasm32-unknown-unknown", "--release"], academyDir)
