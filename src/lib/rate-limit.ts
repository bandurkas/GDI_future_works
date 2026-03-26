import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Create a new ratelimiter, that allows 10 requests per 10 seconds
export const ratelimit = process.env.UPSTASH_REDIS_REST_URL 
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, '10 s'),
      analytics: true,
    })
  : null;

/**
 * Middleware-friendly rate limit check.
 */
export async function checkRateLimit(identifier: string) {
  if (!ratelimit) return { success: true };
  return await ratelimit.limit(identifier);
}
