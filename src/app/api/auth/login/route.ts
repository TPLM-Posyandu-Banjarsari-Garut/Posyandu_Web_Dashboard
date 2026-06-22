import { type NextRequest, NextResponse } from 'next/server'
import { ALLOWED_ROLES, BACKEND_URL } from '@/constants/constants'
import { redis } from '@/lib/redis'

function extractHeaders(req: NextRequest): Record<string, string> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    }
    const origin = req.headers.get('origin')
    if (origin) headers.Origin = origin
    const userAgent = req.headers.get('user-agent')
    if (userAgent) headers['User-Agent'] = userAgent
    const forwardedFor = req.headers.get('x-forwarded-for')
    if (forwardedFor) headers['X-Forwarded-For'] = forwardedFor
    return headers
}

async function handleUnauthorizedRole(
    setCookies: string[]
): Promise<NextResponse> {
    const cookieHeader = setCookies.join('; ')

    await fetch(`${BACKEND_URL}/api/auth/sign-out`, {
        method: 'POST',
        headers: {
            Cookie: cookieHeader
        }
    }).catch(() => {})

    return NextResponse.json({ message: 'UNAUTHORIZED_ROLE' }, { status: 403 })
}

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

interface LoginResponse {
    message?: string
    user?: {
        role: string
        [key: string]: unknown
    }
    session?: Record<string, unknown>
}

async function cacheSessionInRedis(
    cookies: string[],
    data: LoginResponse | null
): Promise<void> {
    if (!redis || !data?.user || !data?.session) return

    const tokenCookie = cookies.find(c =>
        c.includes('better-auth.session_token=')
    )
    if (!tokenCookie) return

    const parts = tokenCookie.split(';')[0].split('=')
    const sessionToken = parts[1]?.trim()
    if (!sessionToken) return

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

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const headers = extractHeaders(req)

        const backendRes = await fetch(
            `${BACKEND_URL}/api/auth/sign-in/email`,
            {
                method: 'POST',
                headers,
                body: JSON.stringify(body)
            }
        )

        const data = (await backendRes
            .json()
            .catch(() => null)) as LoginResponse | null

        if (!backendRes.ok) {
            return NextResponse.json(
                { message: data?.message || 'Incorrect email or password.' },
                { status: backendRes.status }
            )
        }

        if (!data?.user || !ALLOWED_ROLES.has(data.user.role)) {
            return await handleUnauthorizedRole(
                backendRes.headers.getSetCookie()
            )
        }

        const res = NextResponse.json(data, { status: 200 })
        const cookies = backendRes.headers.getSetCookie()
        setCookiesOnResponse(res, cookies)

        res.cookies.set('session_active', 'true', {
            path: '/',
            maxAge: 7 * 24 * 60 * 60,
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        })

        await cacheSessionInRedis(cookies, data)

        return res
    } catch (error) {
        console.error('Login proxy route error:', error)
        return NextResponse.json(
            { message: 'Internal server error.' },
            { status: 500 }
        )
    }
}
