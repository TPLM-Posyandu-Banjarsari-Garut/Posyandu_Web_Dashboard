export interface SessionUser {
    id: string
    email: string
    name?: string
    image?: string
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

export interface RateLimitResult {
    success: boolean
    limit: number
    remaining: number
    resetTime: Date
}
