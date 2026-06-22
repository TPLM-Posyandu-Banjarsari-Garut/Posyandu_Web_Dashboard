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
            let modifiedCookie = cookie
            if (process.env.NODE_ENV !== 'production') {
                modifiedCookie = modifiedCookie.replace(/;\s*Secure/gi, '')
                modifiedCookie = modifiedCookie.replaceAll('__Secure-', '')
                modifiedCookie = modifiedCookie.replace(
                    /SameSite=None/gi,
                    'SameSite=Lax'
                )
            }

            const cookieParts = modifiedCookie.split(';')
            const mainPart = cookieParts[0]
            const eqIndex = mainPart.indexOf('=')
            if (eqIndex !== -1) {
                const name = mainPart.slice(0, eqIndex).trim()
                const value = mainPart.slice(eqIndex + 1).trim()

                const options: {
                    path?: string
                    httpOnly?: boolean
                    secure?: boolean
                    sameSite?: 'lax' | 'strict' | 'none'
                    maxAge?: number
                    expires?: Date
                } = {}

                for (let i = 1; i < cookieParts.length; i++) {
                    const part = cookieParts[i].trim()
                    const partEqIndex = part.indexOf('=')
                    const key =
                        partEqIndex === -1
                            ? part.toLowerCase()
                            : part.slice(0, partEqIndex).trim().toLowerCase()
                    const val =
                        partEqIndex === -1
                            ? ''
                            : part.slice(partEqIndex + 1).trim()

                    if (key === 'path') options.path = val
                    else if (key === 'httponly') options.httpOnly = true
                    else if (key === 'secure') options.secure = true
                    else if (key === 'samesite')
                        options.sameSite = val.toLowerCase() as
                            | 'lax'
                            | 'strict'
                            | 'none'
                    else if (key === 'max-age') options.maxAge = Number(val)
                    else if (key === 'expires') options.expires = new Date(val)
                }
                res.cookies.set(name, value, options)
            }
        }

        return res
    } catch (error) {
        console.error('API session proxy route error:', error)
        return NextResponse.json(null)
    }
}
