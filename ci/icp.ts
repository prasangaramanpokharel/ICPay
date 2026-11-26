import { BACKEND, run } from "./lib.ts"

const args = process.argv.slice(3)
run("icp", args, BACKEND)
