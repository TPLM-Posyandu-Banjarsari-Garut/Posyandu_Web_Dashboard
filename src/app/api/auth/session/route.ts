import { type NextRequest, NextResponse } from 'next/server'
import { BACKEND_URL, SESSION_COOKIE_NAME } from '@/constants/constants'
import { redis } from '@/lib/redis'

interface CookieOptions {
    path?: string
    httpOnly?: boolean
    secure?: boolean
    sameSite?: 'lax' | 'strict' | 'none'
    maxAge?: number
    expires?: Date
}

function parseCookieOptions(parts: string[]): CookieOptions {
    const options: CookieOptions = {}
    for (const part of parts) {
        const trimmed = part.trim()
        const eqIndex = trimmed.indexOf('=')
        const key =
            eqIndex === -1
                ? trimmed.toLowerCase()
                : trimmed.slice(0, eqIndex).trim().toLowerCase()
        const val = eqIndex === -1 ? '' : trimmed.slice(eqIndex + 1).trim()

        switch (key) {
            case 'path':
                options.path = val
                break
            case 'httponly':
                options.httpOnly = true
                break
            case 'secure':
                options.secure = true
                break
            case 'samesite':
                options.sameSite = val.toLowerCase() as
                    | 'lax'
                    | 'strict'
                    | 'none'
                break
            case 'max-age':
                options.maxAge = Number(val)
                break
            case 'expires':
                options.expires = new Date(val)
                break
        }
    }
    return options
}

function setCookiesOnResponse(res: NextResponse, cookies: string[]) {
    const hasSecureToken = cookies.some(c =>
        c.trim().startsWith('__Secure-better-auth.session_token=')
    )

    for (const cookie of cookies) {
        const trimmed = cookie.trim()
        if (
            process.env.NODE_ENV !== 'production' &&
            hasSecureToken &&
            trimmed.startsWith('better-auth.session_token=')
        ) {
            continue
        }

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
        if (eqIndex === -1) continue

        const name = mainPart.slice(0, eqIndex).trim()
        const value = mainPart.slice(eqIndex + 1).trim()
        const options = parseCookieOptions(cookieParts.slice(1))

        res.cookies.set(name, value, options)
    }
}

async function getCachedSession(
    redisKey: string,
    forceRefresh: boolean
): Promise<unknown> {
    if (!redis || forceRefresh) return null
    try {
        const cached = await redis.get(redisKey)
        if (cached) return cached
    } catch (err) {
        console.error('API session Redis read error:', err)
    }
    return null
}

async function deleteCachedSession(redisKey: string): Promise<void> {
    if (!redis) return
    try {
        await redis.del(redisKey)
    } catch (err) {
        console.error('API session Redis delete error:', err)
    }
}

async function cacheSession(
    redisKey: string,
    sessionData: unknown
): Promise<void> {
    if (!redis || !sessionData) return
    try {
        await redis.set(redisKey, sessionData, { ex: 5 * 60 })
    } catch (err) {
        console.error('API session Redis write error:', err)
    }
}

export async function GET(req: NextRequest) {
    try {
        const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value
        if (!sessionToken) {
            return NextResponse.json(null)
        }

        const { searchParams } = new URL(req.url)
        const forceRefresh = searchParams.get('refresh') === 'true'
        const redisKey = `dashboard:session:${sessionToken}`

        const cached = await getCachedSession(redisKey, forceRefresh)
        if (cached) {
            return NextResponse.json(cached)
        }

        const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
            headers: {
                Cookie: `${SESSION_COOKIE_NAME}=${sessionToken}; __Secure-better-auth.session_token=${sessionToken}; better-auth.session_token=${sessionToken}`
            },
            cache: 'no-store'
        })

        if (!response.ok) {
            await deleteCachedSession(redisKey)
            return NextResponse.json(null)
        }

        const resData = await response.json()
        const sessionData = resData?.data || resData

        await cacheSession(redisKey, sessionData)

        const res = NextResponse.json(sessionData)
        setCookiesOnResponse(res, response.headers.getSetCookie())

        return res
    } catch (error) {
        console.error('API session proxy route error:', error)
        return NextResponse.json(null)
    }
}
