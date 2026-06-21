import { type NextRequest, NextResponse } from 'next/server'
import { BACKEND_URL, SESSION_COOKIE_NAME } from '@/constants/constants'
import { redis } from '@/lib/redis'

export async function GET(req: NextRequest) {
    try {
        const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value
        if (!sessionToken) {
            return NextResponse.json(null)
        }

        const redisKey = `dashboard:session:${sessionToken}`
        if (redis) {
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

        return NextResponse.json(sessionData)
    } catch (error) {
        console.error('API session proxy route error:', error)
        return NextResponse.json(null)
    }
}
