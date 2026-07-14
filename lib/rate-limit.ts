type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();
const MAX_ENTRIES = 10_000;
let lastCleanup = 0;

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

export function getRateLimitKey(request: Request, scope: string) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip");
  return `${scope}:${forwardedFor || realIp || "unknown"}`;
}

export function checkRateLimit({ key, limit, windowMs }: RateLimitOptions) {
  const now = Date.now();

  if (now - lastCleanup > 60_000 || store.size >= MAX_ENTRIES) {
    store.forEach((entry, entryKey) => {
      if (entry.resetAt <= now) store.delete(entryKey);
    });
    lastCleanup = now;
  }

  if (!store.has(key) && store.size >= MAX_ENTRIES) {
    const oldestKey = store.keys().next().value as string | undefined;
    if (oldestKey) store.delete(oldestKey);
  }

  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: Math.max(0, limit - 1), resetAt: now + windowMs };
  }

  current.count += 1;
  return {
    allowed: current.count <= limit,
    remaining: Math.max(0, limit - current.count),
    resetAt: current.resetAt,
  };
}

export function enforceRateLimit(request: Request, scope: string, limit = 10, windowMs = 60 * 1000) {
  return checkRateLimit({ key: getRateLimitKey(request, scope), limit, windowMs });
}
