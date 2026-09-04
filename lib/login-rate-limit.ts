import { Redis } from "@upstash/redis";

const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW_SECONDS = 15 * 60;
const redis = Redis.fromEnv();

function getRedisKey(identifier: string) {
  return `login-attempts:${identifier}`;
}

export function getClientIp(requestHeaders: Headers) {
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "unknown";
}

export function createLoginAttemptKey(scope: "admin" | "customer", ip: string, identifier: string) {
  return `${scope}:${ip}:${identifier.trim().toLowerCase()}`;
}

export async function isLoginBlocked(identifier: string) {
  const key = getRedisKey(identifier);
  const attempts = await redis.get<number>(key);
  if ((attempts ?? 0) < MAX_ATTEMPTS) return false;

  return (await redis.ttl(key)) > 0;
}

export async function recordFailedLogin(identifier: string) {
  const key = getRedisKey(identifier);
  const attempts = await redis.incr(key);

  if (attempts === 1) {
    await redis.expire(key, ATTEMPT_WINDOW_SECONDS);
  }

  if (attempts < MAX_ATTEMPTS) return false;
  return (await redis.ttl(key)) > 0;
}

export async function clearLoginAttempts(identifier: string) {
  await redis.del(getRedisKey(identifier));
}
