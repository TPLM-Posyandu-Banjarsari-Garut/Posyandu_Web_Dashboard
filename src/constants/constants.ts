export const ALLOWED_ROLES = new Set(['posyandu_admin', 'village_admin'])
export const SESSION_COOKIE_NAME = '__Secure-better-auth.session_token'
export const BACKEND_URL =
    process.env.API_URL || process.env.NEXT_PUBLIC_API_URL
export const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL
export const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN
