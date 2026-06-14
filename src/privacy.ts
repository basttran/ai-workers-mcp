const BLOCK_PATTERNS: RegExp[] = [
  /\/home\//,
  /\.\/src\//,
  /~\//,
  /```[\s\S]*?```/,
  /\bfunction\s*\w*\s*\(/,
  /\bconst\s+\w+\s*=/,
  /\bimport\s+.+from\s+/,
  /\b(API_KEY|SECRET|TOKEN|PASSWORD)\s*=/i,
];

const WARN_PATTERNS: RegExp[] = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/,
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/,
];

export type PrivacyResult =
  | { status: "ok" }
  | { status: "block"; reason: string }
  | { status: "warn"; reason: string };

export function checkPrivacy(text: string): PrivacyResult {
  for (const pattern of BLOCK_PATTERNS) {
    if (pattern.test(text)) {
      return { status: "block", reason: `Sensitive pattern detected — not sent to Gemini (matched: ${pattern.source})` };
    }
  }
  for (const pattern of WARN_PATTERNS) {
    if (pattern.test(text)) {
      return { status: "warn", reason: `Possible PII detected (matched: ${pattern.source})` };
    }
  }
  return { status: "ok" };
}
