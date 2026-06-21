import { Redis } from '@upstash/redis'
import { REDIS_TOKEN, REDIS_URL } from '@/constants/constants'

export const redis =
    REDIS_URL && REDIS_TOKEN
        ? new Redis({
              url: REDIS_URL,
              token: REDIS_TOKEN
          })
        : null

if (!redis) {
    console.warn(
        'Redis is not configured. Security rate limits and cache checks will be bypassed.'
    )
}
