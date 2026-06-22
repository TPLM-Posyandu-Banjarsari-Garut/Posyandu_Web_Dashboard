export const ALLOWED_ROLES = new Set(['posyandu_admin', 'village_admin'])
export const SESSION_COOKIE_NAME =
    process.env.NODE_ENV === 'production'
        ? '__Secure-better-auth.session_token'
        : 'better-auth.session_token'
export const BACKEND_URL =
    process.env.API_URL || process.env.NEXT_PUBLIC_API_URL
export const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL
export const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

export const typeOptions = [
    { label: 'All Types', value: 'all' },
    { label: 'User', value: 'user' },
    { label: 'Children', value: 'children' },
    { label: 'Posyandu', value: 'posyandu' },
    { label: 'Education', value: 'education' },
    { label: 'Education Category', value: 'education_category' },
    { label: 'Vaccine', value: 'vaccine' },
    { label: 'Vitamin', value: 'vitamin' },
    { label: 'Pregnancy Record', value: 'pregnancy_record' },
    { label: 'Nutrition Record', value: 'nutrition_record' },
    { label: 'Vitamin Record', value: 'vitamin_record' },
    { label: 'Immunization Record', value: 'immunization_record' },
    { label: 'KIPI Detail', value: 'kipi_detail' },
    { label: 'Examination Schedule', value: 'examination_schedule' },
    { label: 'Examination Record', value: 'examination_record' },
    { label: 'Examination', value: 'examination' },
    { label: 'Inventory', value: 'inventory' }
] as const
