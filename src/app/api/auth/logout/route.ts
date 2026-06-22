import { type NextRequest, NextResponse } from 'next/server'
import { BACKEND_URL, SESSION_COOKIE_NAME } from '@/constants/constants'
import { redis } from '@/lib/redis'

export async function POST(req: NextRequest) {
    try {
        const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value

        if (sessionToken && redis) {
            const redisKey = `dashboard:session:${sessionToken}`
            await redis
                .del(redisKey)
                .catch(err => console.error('Redis cache delete error:', err))
        }

        if (sessionToken) {
            const headers: Record<string, string> = {
                Cookie: `${SESSION_COOKIE_NAME}=${sessionToken}`
            }
            const origin = req.headers.get('origin')
            if (origin) headers.Origin = origin
            const userAgent = req.headers.get('user-agent')
            if (userAgent) headers['User-Agent'] = userAgent
            const forwardedFor = req.headers.get('x-forwarded-for')
            if (forwardedFor) headers['X-Forwarded-For'] = forwardedFor

            await fetch(`${BACKEND_URL}/api/auth/sign-out`, {
                method: 'POST',
                headers
            }).catch(err => console.error('Backend sign-out call failed:', err))
        }

        const res = NextResponse.json({ success: true })
        res.cookies.delete(SESSION_COOKIE_NAME)
        res.cookies.delete('session_active')
        return res
    } catch (error) {
        console.error('Logout proxy route error:', error)
        return NextResponse.json({ message: 'Logout failed.' }, { status: 500 })
    }
}
