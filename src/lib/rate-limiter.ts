import { redis } from '@/lib/redis'
import type { RateLimitResult } from '@/types/auth'

export async function checkRateLimit(
    key: string,
    limit: number,
    windowMs: number
): Promise<RateLimitResult> {
    if (!redis) {
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
        return { success: true, limit, remaining: limit, resetTime: new Date() }
    }
}
