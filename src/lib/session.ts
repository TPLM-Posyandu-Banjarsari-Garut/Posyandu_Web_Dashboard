import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { redis } from './redis'

const ALLOWED_ROLES = new Set([
    'posyandu_admin',
    'village_admin',
    'super_admin'
])
const SESSION_COOKIE_NAME = 'better-auth.session_token'
const BACKEND_URL =
    process.env.API_URL || 'https://api.posyandubanjarsari.my.id'

export interface SessionUser {
    id: string
    email: string
    name?: string
    role: string
    status: string
}

export interface SessionData {
    session: {
        id: string
        userId: string
        expiresAt: string | Date
    }
    user: SessionUser
}

/**
 * Validates the session token from the browser cookie.
 * If the session is invalid or the user is not an admin, redirects to login.
 * Caches validated sessions in Redis to avoid hitting the backend on every Page/Component render.
 */
export async function checkSession(): Promise<SessionData> {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!sessionToken) {
        redirect('/login')
    }

    const redisKey = `dashboard:session:${sessionToken}`

    // 1. Try checking cache in Redis
    if (redis) {
        try {
            const cachedSession = await redis.get<SessionData>(redisKey)
            if (cachedSession && ALLOWED_ROLES.has(cachedSession.user.role)) {
                return cachedSession
            }
        } catch (err) {
            console.error('Redis session cache read error:', err)
        }
    }

    // 2. Fetch/Verify with Backend Server
    try {
        const response = await fetch(`${BACKEND_URL}/api/auth/get-session`, {
            headers: {
                // Forward the cookie to the backend
                Cookie: `${SESSION_COOKIE_NAME}=${sessionToken}`
            },
            cache: 'no-store'
        })

        if (!response.ok) {
            redirect('/login')
        }

        const data = await response.json()
        const user = data?.user
        const session = data?.session

        if (!user || !session || !ALLOWED_ROLES.has(user.role)) {
            // Either invalid session or not an admin
            redirect('/login')
        }

        const sessionData: SessionData = { session, user }

        // 3. Cache the verified session in Redis (TTL: 5 minutes)
        if (redis) {
            try {
                await redis.set(redisKey, sessionData, { ex: 5 * 60 })
            } catch (err) {
                console.error('Redis session cache write error:', err)
            }
        }

        return sessionData
    } catch (error) {
        console.error('Session verification backend error:', error)
        // If it's a redirect call from Next.js, let it throw
        if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
            throw error
        }
        redirect('/login')
    }
}
