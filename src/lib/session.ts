import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
    ALLOWED_ROLES,
    BACKEND_URL,
    SESSION_COOKIE_NAME
} from '@/constants/constants'
import { redis } from '@/lib/redis'
import type { SessionData } from '@/types/auth'

async function getCachedSession(redisKey: string): Promise<SessionData | null> {
    if (!redis) return null
    try {
        const cached = await redis.get<SessionData>(redisKey)
        if (cached && ALLOWED_ROLES.has(cached.user.role)) {
            return cached
        }
    } catch (err) {
        console.error('Redis session cache read error:', err)
    }
    return null
}

async function fetchSessionFromBackend(
    sessionToken: string
): Promise<SessionData | null> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
            headers: {
                Cookie: `${SESSION_COOKIE_NAME}=${sessionToken}`
            },
            cache: 'no-store'
        })

        if (!response.ok) {
            if (redis) {
                try {
                    const redisKey = `dashboard:session:${sessionToken}`
                    await redis.del(redisKey)
                } catch (err) {
                    console.error('Session Redis delete error:', err)
                }
            }
            return null
        }

        const resData = await response.json()
        const sessionData = resData?.data || resData
        const user = sessionData?.user
        const session = sessionData?.session

        if (!user || !session || !ALLOWED_ROLES.has(user.role)) {
            return null
        }

        return { session, user }
    } catch (error) {
        console.error('Session verification backend error:', error)
        if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
            throw error
        }
        return null
    }
}

async function cacheSession(
    redisKey: string,
    sessionData: SessionData
): Promise<void> {
    if (!redis) return
    try {
        await redis.set(redisKey, sessionData, { ex: 5 * 60 })
    } catch (err) {
        console.error('Redis session cache write error:', err)
    }
}

export async function checkSession(): Promise<SessionData> {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!sessionToken) {
        redirect('/unauthorized')
    }

    const redisKey = `dashboard:session:${sessionToken}`

    const cached = await getCachedSession(redisKey)
    if (cached) {
        return cached
    }

    const sessionData = await fetchSessionFromBackend(sessionToken)
    if (!sessionData) {
        redirect('/unauthorized')
    }

    await cacheSession(redisKey, sessionData)
    return sessionData
}
