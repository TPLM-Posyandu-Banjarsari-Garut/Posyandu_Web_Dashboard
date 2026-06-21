import { cookies, headers } from 'next/headers'
import { BACKEND_URL, SESSION_COOKIE_NAME } from '@/constants/constants'

export async function useApi(path: string, init?: RequestInit) {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    const requestHeaders = await headers()
    const origin = requestHeaders.get('origin')
    const userAgent = requestHeaders.get('user-agent')
    const forwardedFor = requestHeaders.get('x-forwarded-for')

    const baseUrl = BACKEND_URL?.endsWith('/')
        ? BACKEND_URL.slice(0, -1)
        : BACKEND_URL
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    const url = `${baseUrl}${cleanPath}`

    const headersList: Record<string, string> = {
        'Content-Type': 'application/json'
    }

    if (sessionToken)
        headersList.Cookie = `${SESSION_COOKIE_NAME}=${sessionToken}`
    if (origin) headersList.Origin = origin
    if (userAgent) headersList['User-Agent'] = userAgent
    if (forwardedFor) headersList['X-Forwarded-For'] = forwardedFor

    return fetch(url, {
        ...init,
        headers: {
            ...headersList,
            ...init?.headers
        },
        cache: 'no-store'
    })
}
