import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const isConfigured = redisUrl && redisUrl !== 'https://replace-me.upstash.io' && redisUrl !== 'https://localhost';

// Create a new ratelimiter, that allows 3 requests per 60 seconds
export const ratelimit = isConfigured 
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(3, "60 s"),
      analytics: true,
      prefix: "@upstash/ratelimit",
    })
  : {
      limit: async () => ({ success: true, limit: 0, remaining: 0, reset: 0 }),
    };
