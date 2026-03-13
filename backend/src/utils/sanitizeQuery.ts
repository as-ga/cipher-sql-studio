const BLOCKED_KEYWORDS = [
  "DROP",
  "DELETE",
  "UPDATE",
  "ALTER",
  "INSERT",
  "TRUNCATE",
] as const;

// Matches word boundaries so column names like "updated_at" don't false-positive.
const BLOCKED_PATTERN = new RegExp(
  `\\b(${BLOCKED_KEYWORDS.join("|")})\\b`,
  "i"
);

export interface SanitizeResult {
  safe: boolean;
  reason?: string;
}

export function sanitizeQuery(raw: string): SanitizeResult {
  const trimmed = raw.trim();

  if (trimmed.length === 0) {
    return { safe: false, reason: "Query must not be empty." };
  }

  // Strip inline (--) and block (/* */) comments before validation
  const stripped = trimmed
    .replace(/--.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .trim();

  // After stripping comments ensure the query still starts with SELECT
  if (!/^\s*SELECT\b/i.test(stripped)) {
    return { safe: false, reason: "Only SELECT statements are allowed." };
  }

  // Check for blocked keywords (on the comment-stripped version)
  const match = BLOCKED_PATTERN.exec(stripped);
  if (match) {
    return {
      safe: false,
      reason: `Forbidden keyword detected: ${match[1].toUpperCase()}`,
    };
  }

  // Disallow multiple statements (semicolon followed by non-whitespace)
  const withoutStrings = stripped.replace(/'[^']*'/g, "");
  if (/;\s*\S/.test(withoutStrings)) {
    return { safe: false, reason: "Multiple statements are not allowed." };
  }

  return { safe: true };
}
