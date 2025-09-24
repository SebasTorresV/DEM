const buckets = new Map<string, { tokens: number; reset: number }>();

interface Options {
  limit: number;
  windowMs: number;
}

export function rateLimit(key: string, { limit, windowMs }: Options) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.reset < now) {
    buckets.set(key, { tokens: limit - 1, reset: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (bucket.tokens <= 0) {
    return { success: false, remaining: 0, retryAfter: bucket.reset - now };
  }

  bucket.tokens -= 1;
  return { success: true, remaining: bucket.tokens };
}
