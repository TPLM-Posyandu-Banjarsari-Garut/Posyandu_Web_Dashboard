import { type NextRequest, NextResponse } from 'next/server'
import { BACKEND_URL, SESSION_COOKIE_NAME } from '@/constants/constants'
import { redis } from '@/lib/redis'

export async function POST(req: NextRequest) {
    const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value

    if (sessionToken) {
        if (redis) {
            const redisKey = `dashboard:session:${sessionToken}`
            await redis
                .del(redisKey)
                .catch(err =>
                    console.error('Redis session cache deletion failed:', err)
                )
        }

        await fetch(`${BACKEND_URL}/api/auth/sign-out`, {
            method: 'POST',
            headers: {
                Cookie: `${SESSION_COOKIE_NAME}=${sessionToken}`
            }
        }).catch(err => console.error('Backend logout call failed:', err))
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set(SESSION_COOKIE_NAME, '', {
        maxAge: 0,
        path: '/'
    })

    return response
}
