import { Redis } from '@upstash/redis'

const redisUrl = process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

export const redis =
    redisUrl && redisToken
        ? new Redis({
              url: redisUrl,
              token: redisToken
          })
        : null

if (!redis) {
    console.warn(
        'Redis is not configured. Security rate limits and cache checks will be bypassed.'
    )
}
