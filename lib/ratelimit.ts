import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redisUrl   = process.env.UPSTASH_REDIS_REST_URL;
const isConfigured =
  !!redisUrl &&
  redisUrl !== 'https://replace-me.upstash.io' &&
  redisUrl !== 'https://localhost';

/** Typed fallback so call-sites don't need `as any` casts */
interface RatelimitLike {
  limit(key: string): Promise<{ success: boolean; limit: number; remaining: number; reset: number }>;
}

// 20 req / 60 s — razoável para uso normal, bloqueia bots
export const ratelimit: RatelimitLike = isConfigured
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(20, '60 s'),
      analytics: true,
      prefix: '@upstash/ratelimit',
    })
  : {
      limit: async () => ({ success: true, limit: 0, remaining: 0, reset: 0 }),
    };
