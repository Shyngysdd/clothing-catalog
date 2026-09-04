import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function getOrSetCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  try {
    const cachedValue = await redis.get<string>(key);
    if (cachedValue !== null) return JSON.parse(cachedValue) as T;
  } catch {
    return fetcher();
  }

  const result = await fetcher();

  try {
    await redis.set(key, JSON.stringify(result), { ex: ttlSeconds });
  } catch {
    // Cache failures must not prevent fresh data from being returned.
  }

  return result;
}
