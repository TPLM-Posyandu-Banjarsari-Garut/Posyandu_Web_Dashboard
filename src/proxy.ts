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
        const response = await fetch(`${BACKEND_URL}/api/auth/get-session`, {
            headers: {
                Cookie: `${SESSION_COOKIE_NAME}=${sessionToken}`
            },
            cache: 'no-store'
        })

        if (!response.ok) return false

        const data = await response.json()
        const user = data?.user
        const session = data?.session

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

    if (!pathname.startsWith('/dashboard')) {
        return NextResponse.next()
    }

    const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value
    if (!sessionToken) {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    const redisKey = `dashboard:session:${sessionToken}`

    const isCachedValid = await checkCachedSession(redisKey)
    if (isCachedValid) {
        return NextResponse.next()
    }

    const isValid = await fetchAndCacheSession(sessionToken, redisKey)
    if (!isValid) {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/dashboard/:path*']
}
