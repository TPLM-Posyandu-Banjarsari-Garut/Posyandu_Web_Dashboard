import { type NextRequest, NextResponse } from 'next/server'

import {
    ALLOWED_ROLES,
    BACKEND_URL,
    SESSION_COOKIE_NAME
} from '@/constants/constants'
import { redis } from '@/lib/redis'

async function checkCachedSession(redisKey: string): Promise<boolean> {
    if (!redis) return false
    try {
        const cached = await redis.get<{ user: { role: string } }>(redisKey)
        return !!(cached && ALLOWED_ROLES.has(cached.user.role))
    } catch (err) {
        console.error('Proxy Redis read error:', err)
        return false
    }
}

async function fetchAndCacheSession(
    sessionToken: string,
    redisKey: string
): Promise<boolean> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
            headers: {
                Cookie: `${SESSION_COOKIE_NAME}=${sessionToken}; __Secure-better-auth.session_token=${sessionToken}; better-auth.session_token=${sessionToken}`
            },
            cache: 'no-store'
        })

        if (!response.ok) {
            if (redis) {
                try {
                    await redis.del(redisKey)
                } catch (err) {
                    console.error('Proxy Redis delete error:', err)
                }
            }
            return false
        }

        const resData = await response.json()
        const sessionData = resData?.data || resData
        const user = sessionData?.user
        const session = sessionData?.session

        if (!user || !session || !ALLOWED_ROLES.has(user.role)) {
            return false
        }

        if (redis) {
            try {
                await redis.set(redisKey, { session, user }, { ex: 5 * 60 })
            } catch (err) {
                console.error('Proxy Redis write error:', err)
            }
        }

        return true
    } catch (error) {
        console.error('Proxy verification backend error:', error)
        return false
    }
}

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl

    const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value
    let hasSession = false

    if (sessionToken) {
        const redisKey = `dashboard:session:${sessionToken}`
        const isCachedValid = await checkCachedSession(redisKey)
        if (isCachedValid) {
            hasSession = true
        } else {
            hasSession = await fetchAndCacheSession(sessionToken, redisKey)
        }
    }

    if (pathname === '/') {
        if (hasSession) {
            return NextResponse.redirect(new URL('/dashboard', req.url))
        }
        return NextResponse.next()
    }

    if (!hasSession) {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/', '/dashboard/:path*']
}
