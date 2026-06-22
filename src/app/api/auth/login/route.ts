import { type NextRequest, NextResponse } from 'next/server'
import {
    ALLOWED_ROLES,
    BACKEND_URL,
    SESSION_COOKIE_NAME
} from '@/constants/constants'
import { redis } from '@/lib/redis'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        }
        const origin = req.headers.get('origin')
        if (origin) headers.Origin = origin
        const userAgent = req.headers.get('user-agent')
        if (userAgent) headers['User-Agent'] = userAgent
        const forwardedFor = req.headers.get('x-forwarded-for')
        if (forwardedFor) headers['X-Forwarded-For'] = forwardedFor

        const backendRes = await fetch(
            `${BACKEND_URL}/api/auth/sign-in/email`,
            {
                method: 'POST',
                headers,
                body: JSON.stringify(body)
            }
        )

        const data = await backendRes.json().catch(() => null)

        if (!backendRes.ok) {
            return NextResponse.json(
                { message: data?.message || 'Incorrect email or password.' },
                { status: backendRes.status }
            )
        }

        if (!data?.user || !ALLOWED_ROLES.has(data.user.role)) {
            const setCookies = backendRes.headers.getSetCookie()
            const cookieHeader = setCookies.join('; ')

            await fetch(`${BACKEND_URL}/api/auth/sign-out`, {
                method: 'POST',
                headers: {
                    Cookie: cookieHeader
                }
            }).catch(() => {})

            return NextResponse.json(
                { message: 'UNAUTHORIZED_ROLE' },
                { status: 403 }
            )
        }

        const res = NextResponse.json(data, { status: 200 })
        const cookies = backendRes.headers.getSetCookie()
        for (const cookie of cookies) {
            res.headers.append('set-cookie', cookie)
        }

        res.cookies.set('session_active', 'true', {
            path: '/',
            maxAge: 7 * 24 * 60 * 60,
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        })

        if (redis && data?.user && data?.session) {
            const tokenCookie = cookies.find(c =>
                c.startsWith(`${SESSION_COOKIE_NAME}=`)
            )
            if (tokenCookie) {
                const sessionToken = tokenCookie.split(';')[0].split('=')[1]
                if (sessionToken) {
                    const redisKey = `dashboard:session:${sessionToken}`
                    try {
                        await redis.set(
                            redisKey,
                            { session: data.session, user: data.user },
                            { ex: 5 * 60 }
                        )
                    } catch (err) {
                        console.error('Login Redis cache write error:', err)
                    }
                }
            }
        }

        return res
    } catch (error) {
        console.error('Login proxy route error:', error)
        return NextResponse.json(
            { message: 'Internal server error.' },
            { status: 500 }
        )
    }
}
