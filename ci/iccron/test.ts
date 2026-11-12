import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { run, step } from "../lib.ts"

const iccronDir = resolve(dirname(fileURLToPath(import.meta.url)), "../../backend/rust/iccron")

if (!process.env.SDKROOT && process.platform === "darwin") {
  process.env.SDKROOT = "/Library/Developer/CommandLineTools/SDKs/MacOSX15.4.sdk"
}

if (process.env.HOME && !process.env.PATH?.includes(".cargo/bin")) {
  process.env.PATH = `${process.env.HOME}/.cargo/bin:${process.env.PATH}`
}

step("ICCRON UNIT TESTS")
run("cargo", ["test"], iccronDir)
