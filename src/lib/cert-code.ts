export type CertCodeSettings = {
  cert_code_prefix?: string | null;
  cert_code_include_year?: boolean | null;
  cert_code_random_length?: number | null;
};

export const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function normalizeSettings(s?: CertCodeSettings | null) {
  const prefix = (s?.cert_code_prefix ?? "TBM").trim().toUpperCase() || "TBM";
  const includeYear = s?.cert_code_include_year ?? true;
  const raw = s?.cert_code_random_length ?? 6;
  const length = Math.min(12, Math.max(3, Number(raw) || 6));
  return { prefix, includeYear, length };
}

export function randomPart(length: number) {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}

export function suggestCode(s?: CertCodeSettings | null) {
  const { prefix, includeYear, length } = normalizeSettings(s);
  const parts = [prefix];
  if (includeYear) parts.push(String(new Date().getFullYear()));
  parts.push(randomPart(length));
  return parts.join("-");
}

export function codePattern(s?: CertCodeSettings | null) {
  const { prefix, includeYear, length } = normalizeSettings(s);
  const parts = [prefix];
  if (includeYear) parts.push(String(new Date().getFullYear()));
  parts.push("X".repeat(length));
  return parts.join("-");
}

export function normalizeCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "-");
}

/** Returns an error message, or null when valid. */
export function validateCode(value: string): string | null {
  const code = normalizeCode(value);
  if (!code) return "A certificate code is required.";
  if (code.length < 4) return "Code must be at least 4 characters.";
  if (code.length > 40) return "Code must be 40 characters or fewer.";
  if (!/^[A-Z0-9-]+$/.test(code)) return "Use letters, numbers and hyphens only.";
  if (/^-|-$|--/.test(code)) return "Hyphens can't start, end, or repeat in the code.";
  return null;
}
