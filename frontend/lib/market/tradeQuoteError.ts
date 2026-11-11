export type TradeQuoteErrorKind =
  | "blocked"
  | "no_pool"
  | "liquidity"
  | "too_small"
  | "unsupported"
  | "same_token"
  | "unknown"

export function classifyTradeQuoteError(err: unknown): TradeQuoteErrorKind {
  const msg = (err instanceof Error ? err.message : String(err ?? "")).toLowerCase()
  if (msg.includes("cannot be traded") || msg.includes("icpay cannot")) return "blocked"
  if (msg.includes("no pool found") || msg.includes("pool not found") || msg.includes("no pool for")) return "no_pool"
  if (
    msg.includes("liquidity") ||
    msg.includes("insufficient funds") ||
    msg.includes("insufficientfunds") ||
    msg.includes("commonerror") ||
    msg.includes("common error") ||
    msg.includes("insufficient liquidity") ||
    msg.includes("pool liquidity")
  ) {
    return "liquidity"
  }
  if (msg.includes("too small")) return "too_small"
  if (msg.includes("unsupported")) return "unsupported"
  if (msg.includes("sametoken") || msg.includes("same token")) return "same_token"
  return "unknown"
}

export type TradeExecErrorKind =
  | "slippage"
  | "liquidity"
  | "balance"
  | "auth"
  | "timeout"
  | "canister_method"
  | "rate_limit"
  | "allowance"
  | "busy"
  | "unknown"

export function classifyTradeExecError(err: unknown): TradeExecErrorKind {
  const msg = (err instanceof Error ? err.message : String(err ?? "")).toLowerCase()
  if (
    msg.includes("rate limit") ||
    msg.includes("too many requests") ||
    msg.includes("throttled")
  ) {
    return "rate_limit"
  }
  if (
    msg.includes("allowance") ||
    msg.includes("icrc2_approve") ||
    msg.includes("bad allowance") ||
    msg.includes("insufficientallowance")
  ) {
    return "allowance"
  }
  if (
    msg.includes("user busy") ||
    msg.includes("trade lock")
  ) {
    return "busy"
  }
  if (
    msg.includes("insufficient") &&
    (msg.includes("balance") || msg.includes("trade") || msg.includes("trading") || msg.includes("funds") || msg.includes("fee"))
  ) {
    return "balance"
  }
  if (
    msg.includes("slippage") ||
    msg.includes("less than amountoutminimum") ||
    msg.includes("amountout is less") ||
    msg.includes("amountoutminimum")
  ) {
    return "slippage"
  }
  if (
    msg.includes("liquidity") ||
    msg.includes("no pool") ||
    msg.includes("commonerror") ||
    msg.includes("common error")
  ) {
    return "liquidity"
  }
  if (msg.includes("timeout") || msg.includes("timed out")) return "timeout"
  if (
    msg.includes("no update method") ||
    msg.includes("has no update method") ||
    msg.includes("ic0536") ||
    msg.includes("method not found")
  ) {
    return "canister_method"
  }
  if (
    msg.includes("authentication required") ||
    msg.includes("anonymous") ||
    msg.includes("caller is not authorized")
  ) {
    return "auth"
  }
  return "unknown"
}

export function isInsufficientBalanceError(err: unknown): boolean {
  const msg = (err instanceof Error ? err.message : String(err ?? "")).toLowerCase()
  return (
    msg.includes("insufficient") &&
    (msg.includes("balance") || msg.includes("trading") || msg.includes("funds") || msg.includes("fee") || msg.includes("not enough"))
  )
}

export function formatTradeErrorMessage(err: unknown): string {
  if (!err) return "Trade failed"
  const rawMsg = (err instanceof Error ? err.message : String(err)).trim()
  const lower = rawMsg.toLowerCase()

  if (
    lower.includes("rate limit") ||
    lower.includes("too many requests") ||
    lower.includes("throttled")
  ) {
    const waitMatch = rawMsg.match(/wait\s+(\d+)s/i)
    if (waitMatch && waitMatch[1]) {
      return `Rate limit reached. Please wait ${waitMatch[1]}s before submitting another trade.`
    }
    return "Rate limit reached. Please wait a few seconds before submitting another trade."
  }
  if (
    lower.includes("allowance") ||
    lower.includes("icrc2_approve") ||
    lower.includes("insufficientallowance")
  ) {
    return "ICRC-2 token allowance failed. Ensure token allowance is approved."
  }
  if (lower.includes("user busy") || lower.includes("trade lock")) {
    return "A previous trade is still confirming on-chain. Please wait a moment."
  }
  if (isInsufficientBalanceError(err)) {
    return "Insufficient trading balance. Deposit funds into your trading balance to place this order."
  }
  if (
    lower.includes("slippage") ||
    lower.includes("less than amountoutminimum") ||
    lower.includes("amountout is less") ||
    lower.includes("amountoutminimum")
  ) {
    return "Slippage tolerance exceeded. Market price moved before execution. Try increasing slippage."
  }
  if (lower.includes("liquidity") || lower.includes("no pool")) {
    return "Insufficient pool liquidity for this order size. Try trading a smaller amount."
  }
  if (lower.includes("timeout") || lower.includes("timed out")) {
    return "Trade request timed out on-chain. Please check your trade history before retrying."
  }
  if (lower.includes("authentication") || lower.includes("anonymous") || lower.includes("sign in")) {
    return "Authentication required. Please sign in with Internet Identity."
  }
  if (
    lower.includes("has no update method") ||
    lower.includes("no update method") ||
    lower.includes("ic0536")
  ) {
    return "Trading canister method unavailable. Please refresh and try again."
  }

  // If it's an IC replica rejection, extract clean reject text:
  const rejectMatch = rawMsg.match(/Reject text:\s*([^\n\r]+)/i)
  if (rejectMatch && rejectMatch[1]) {
    let clean = rejectMatch[1].trim()
    clean = clean.replace(/^Error from Canister [^:]+:\s*/i, "")
    clean = clean.replace(/\.\.+$/, ".")
    if (clean.length > 5 && clean.length < 150) {
      return clean
    }
  }

  // If too long / contains call context or stack traces, simplify:
  if (
    rawMsg.length > 180 ||
    rawMsg.includes("Call context:") ||
    rawMsg.includes("Request ID:") ||
    rawMsg.includes("Error code:")
  ) {
    const firstLine = rawMsg.split("\n")[0]?.trim()
    if (firstLine && firstLine.length < 120 && !firstLine.includes("rejection error")) {
      return firstLine
    }
    return "Trade failed on-chain. Please verify your trading balance and retry."
  }

  return rawMsg
}

export function shouldRetryTradeQuote(err: unknown): boolean {
  return classifyTradeQuoteError(err) === "unknown"
}

export function extractRateLimitWaitSeconds(err: unknown): number | null {
  const rawMsg = (err instanceof Error ? err.message : String(err ?? "")).trim()
  const match = rawMsg.match(/wait\s+(\d+)s/i)
  if (match && match[1]) {
    const secs = Number.parseInt(match[1], 10)
    if (!Number.isNaN(secs) && secs > 0 && secs <= 60) {
      return secs
    }
  }
  return null
}

