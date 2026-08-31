const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const BLOCK_DURATION_MS = 15 * 60 * 1000;

type LoginAttempt = { attempts: number[]; blockedUntil: number | null };

const attempts = new Map<string, LoginAttempt>();

function cleanEntry(entry: LoginAttempt, now: number) {
  entry.attempts = entry.attempts.filter((timestamp) => now - timestamp < ATTEMPT_WINDOW_MS);
  if (entry.blockedUntil && entry.blockedUntil <= now) entry.blockedUntil = null;
}

function cleanup(now: number) {
  for (const [key, entry] of attempts) {
    cleanEntry(entry, now);
    if (!entry.blockedUntil && entry.attempts.length === 0) attempts.delete(key);
  }
}

export function getClientIp(requestHeaders: Headers) {
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "unknown";
}

export function createLoginAttemptKey(scope: "admin" | "customer", ip: string, identifier: string) {
  return `${scope}:${ip}:${identifier.trim().toLowerCase()}`;
}

export function isLoginBlocked(key: string) {
  const now = Date.now();
  cleanup(now);
  const entry = attempts.get(key);
  return Boolean(entry?.blockedUntil && entry.blockedUntil > now);
}

export function recordFailedLogin(key: string) {
  const now = Date.now();
  cleanup(now);
  const entry = attempts.get(key) ?? { attempts: [], blockedUntil: null };
  entry.attempts.push(now);
  if (entry.attempts.length >= MAX_ATTEMPTS) {
    entry.blockedUntil = now + BLOCK_DURATION_MS;
    entry.attempts = [];
  }
  attempts.set(key, entry);
  return Boolean(entry.blockedUntil);
}

export function clearLoginAttempts(key: string) {
  attempts.delete(key);
}
