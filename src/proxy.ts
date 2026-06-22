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
                Cookie: `${SESSION_COOKIE_NAME}=${sessionToken}`
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

function handleApiProxy(req: NextRequest, pathname: string) {
    const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const headers = new Headers(req.headers)

    if (sessionToken) {
        headers.set('Cookie', `${SESSION_COOKIE_NAME}=${sessionToken}`)
    }

    const backendUrl = BACKEND_URL?.endsWith('/')
        ? BACKEND_URL.slice(0, -1)
        : BACKEND_URL

    return NextResponse.rewrite(
        new URL(`${pathname}${req.nextUrl.search}`, backendUrl),
        {
            request: {
                headers
            }
        }
    )
}

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl

    // Proxy client-side API requests and inject the required session cookies
    if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
        return handleApiProxy(req, pathname)
    }

    const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value
    let hasSession = false

    if (sessionToken) {
        const redisKey = `dashboard:session:${sessionToken}`
        hasSession =
            (await checkCachedSession(redisKey)) ||
            (await fetchAndCacheSession(sessionToken, redisKey))
    }

    if (pathname === '/') {
        return hasSession
            ? NextResponse.redirect(new URL('/dashboard', req.url))
            : NextResponse.next()
    }

    if (pathname === '/unauthorized' && hasSession) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    if (!hasSession && pathname !== '/unauthorized') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/', '/dashboard/:path*', '/api/:path*', '/unauthorized']
}
