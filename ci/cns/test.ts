import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { run, step } from "../lib.ts"

const cnsDir = resolve(dirname(fileURLToPath(import.meta.url)), "../../backend/rust/cnsmangment")

step("CNS TESTS / CHECK")
run("cargo", ["check", "--target", "wasm32-unknown-unknown"], cnsDir)
