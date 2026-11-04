import type { Request, Response, NextFunction } from 'express';

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, TokenBucket>();

// Default rate: 60 requests per minute per IP, max bucket capacity 60
const MAX_TOKENS = 60;
const REFILL_RATE_PER_MS = 60 / (60 * 1000); // 1 token per second

/**
 * In-memory Token Bucket rate limiter per IP address.
 */
export function createRateLimiter(maxTokens: number = MAX_TOKENS, refillRate: number = REFILL_RATE_PER_MS) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    let bucket = buckets.get(ip);
    if (!bucket) {
      bucket = { tokens: maxTokens, lastRefill: now };
      buckets.set(ip, bucket);
    } else {
      const elapsed = now - bucket.lastRefill;
      bucket.tokens = Math.min(maxTokens, bucket.tokens + elapsed * refillRate);
      bucket.lastRefill = now;
    }

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      next();
    } else {
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'AI Coach rate limit exceeded. Please wait a moment before sending another request.',
      });
    }
  };
}

export function resetRateLimiter(): void {
  buckets.clear();
}
