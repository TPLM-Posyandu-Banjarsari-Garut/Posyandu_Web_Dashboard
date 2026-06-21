import { redis } from './redis'

export interface RateLimitResult {
    success: boolean
    limit: number
    remaining: number
    resetTime: Date
}

/**
 * Checks sliding window rate limit for a specific key
 * @param key Redis key to track hits
 * @param limit Maximum hits allowed in window
 * @param windowMs Time window in milliseconds
 */
export async function checkRateLimit(
    key: string,
    limit: number,
    windowMs: number
): Promise<RateLimitResult> {
    if (!redis) {
        // If Redis is not configured, allow access
        return { success: true, limit, remaining: limit, resetTime: new Date() }
    }

    const now = Date.now()
    const windowStart = now - windowMs

    try {
        const pipeline = redis.pipeline()
        pipeline.zremrangebyscore(key, 0, windowStart)
        pipeline.zadd(key, {
            score: now,
            member: `${now}-${crypto.randomUUID()}`
        })
        pipeline.zcard(key)
        pipeline.pexpire(key, windowMs)

        const results = await pipeline.exec()
        const totalHits = (results[2] as number) || 0
        const resetTime = new Date(now + windowMs)

        const success = totalHits <= limit
        const remaining = Math.max(0, limit - totalHits)

        return {
            success,
            limit,
            remaining,
            resetTime
        }
    } catch (error) {
        console.error('Rate limit Redis check failed:', error)
        // Fail open to avoid blocking users if Redis is temporarily down
        return { success: true, limit, remaining: limit, resetTime: new Date() }
    }
}
