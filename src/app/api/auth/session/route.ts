import { type NextRequest, NextResponse } from 'next/server'
import { BACKEND_URL, SESSION_COOKIE_NAME } from '@/constants/constants'
import { redis } from '@/lib/redis'

export async function GET(req: NextRequest) {
    try {
        const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value
        if (!sessionToken) {
            return NextResponse.json(null)
        }

        const { searchParams } = new URL(req.url)
        const forceRefresh = searchParams.get('refresh') === 'true'
        const redisKey = `dashboard:session:${sessionToken}`

        if (redis && !forceRefresh) {
            try {
                const cached = await redis.get(redisKey)
                if (cached) {
                    return NextResponse.json(cached)
                }
            } catch (err) {
                console.error('API session Redis read error:', err)
            }
        }

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
                    console.error('API session Redis delete error:', err)
                }
            }
            return NextResponse.json(null)
        }

        const resData = await response.json()
        const sessionData = resData?.data || resData

        if (sessionData && redis) {
            try {
                await redis.set(redisKey, sessionData, { ex: 5 * 60 })
            } catch (err) {
                console.error('API session Redis write error:', err)
            }
        }

        const res = NextResponse.json(sessionData)

        // Forward set-cookie headers (session token updates) to browser
        const setCookies = response.headers.getSetCookie()
        for (const cookie of setCookies) {
            res.headers.append('set-cookie', cookie)
        }

        return res
    } catch (error) {
        console.error('API session proxy route error:', error)
        return NextResponse.json(null)
    }
}
