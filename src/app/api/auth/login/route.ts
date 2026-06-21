import { type NextRequest, NextResponse } from 'next/server'
import { ALLOWED_ROLES, BACKEND_URL } from '@/constants/constants'
import { checkRateLimit } from '@/lib/rate-limiter'
import { redis } from '@/lib/redis'
import zodSignInInput from '@/validations/zod-SignInInput'

function getClientIp(req: NextRequest): string {
    const forwardedFor = req.headers.get('x-forwarded-for')
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim()
    }
    return '127.0.0.1'
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        const validation = zodSignInInput.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(
                { message: 'Format input tidak valid.' },
                { status: 400 }
            )
        }

        const { email, password } = validation.data
        const ip = getClientIp(req)
        const userAgent = req.headers.get('user-agent') || 'Unknown'

        const ipLimitKey = `rate:login:ip:${ip}`
        const ipLimit = await checkRateLimit(ipLimitKey, 3, 5 * 60 * 1000)

        const emailLimitKey = `rate:login:email:${email.toLowerCase()}`
        const emailLimit = await checkRateLimit(
            emailLimitKey,
            5,
            60 * 60 * 1000
        )

        if (!ipLimit.success || !emailLimit.success) {
            if (redis) {
                await redis.hset(`auth:blocked:${ip}`, {
                    email,
                    timestamp: new Date().toISOString(),
                    reason: !ipLimit.success
                        ? 'IP rate limit exceeded'
                        : 'Email rate limit exceeded',
                    userAgent
                })
            }
            return NextResponse.json(
                {
                    message:
                        'Terlahu banyak percobaan masuk. Silakan coba lagi nanti.'
                },
                { status: 429 }
            )
        }

        const backendUrl = `${BACKEND_URL}/api/auth/sign-in/email`

        const backendResponse = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': userAgent,
                'x-forwarded-for': ip
            },
            body: JSON.stringify({ email, password })
        })

        const data = await backendResponse.json().catch(() => null)

        if (!backendResponse.ok) {
            if (redis) {
                const failKey = `auth:failed:${email.toLowerCase()}`
                await redis.hset(failKey, {
                    lastAttempt: new Date().toISOString(),
                    ip,
                    userAgent,
                    errorMessage: data?.message || 'Authentication failed'
                })
                await redis.expire(failKey, 24 * 60 * 60)
            }

            return NextResponse.json(
                { message: data?.message || 'Email atau password salah.' },
                { status: backendResponse.status }
            )
        }

        const user = data?.user
        const session = data?.session

        if (!user || !session) {
            return NextResponse.json(
                { message: 'Gagal mendapatkan data sesi dari server.' },
                { status: 500 }
            )
        }

        const userRole = user.role
        if (!ALLOWED_ROLES.has(userRole)) {
            const sessionToken = data?.token
            const cookiesHeader = backendResponse.headers.get('set-cookie')

            await fetch(`${BACKEND_URL}/api/auth/sign-out`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${sessionToken}`,
                    Cookie: cookiesHeader || ''
                }
            }).catch(err =>
                console.error(
                    'Failed to automatically signout unauthorized user:',
                    err
                )
            )

            if (redis) {
                await redis.lpush(
                    'auth:unauthorized_attempts',
                    JSON.stringify({
                        email,
                        role: userRole,
                        ip,
                        userAgent,
                        timestamp: new Date().toISOString()
                    })
                )
                await redis.ltrim('auth:unauthorized_attempts', 0, 99)
            }

            return NextResponse.json(
                {
                    message:
                        'Akses ditolak. Akun Anda tidak memiliki hak akses Administrator.'
                },
                { status: 403 }
            )
        }

        if (redis) {
            const auditKey = `auth:logs:${user.id}`
            await redis.hset(auditKey, {
                lastLogin: new Date().toISOString(),
                ip,
                userAgent,
                role: userRole,
                email: user.email
            })
        }

        const response = NextResponse.json(data)
        const setCookieHeaders = backendResponse.headers.getSetCookie()

        for (const cookie of setCookieHeaders) {
            response.headers.append('set-cookie', cookie)
        }

        return response
    } catch (error) {
        console.error('Proxy auth login error:', error)
        return NextResponse.json(
            { message: 'Terjadi kesalahan internal server.' },
            { status: 500 }
        )
    }
}
