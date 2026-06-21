export const ALLOWED_ROLES = new Set([
    'posyandu_admin',
    'village_admin',
    'super_admin'
])
export const ALLOWED_ROLES_ARRAY = [
    'posyandu_admin',
    'village_admin',
    'super_admin'
]
export const SESSION_COOKIE_NAME = 'better-auth.session_token'
export const BACKEND_URL = process.env.API_URL
export const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL
export const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN
