import { BACKEND_URL, SESSION_COOKIE_NAME } from '@/constants/constants'

export async function apiClient(path: string, init?: RequestInit) {
    const headersList: Record<string, string> = {
        'Content-Type': 'application/json'
    }

    const isServer = globalThis.window === undefined

    if (isServer) {
        try {
            const { cookies, headers } = await import('next/headers')
            const cookieStore = await cookies()
            const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

            const requestHeaders = await headers()
            const origin = requestHeaders.get('origin')
            const userAgent = requestHeaders.get('user-agent')
            const forwardedFor = requestHeaders.get('x-forwarded-for')

            if (sessionToken) {
                headersList.Cookie = `${SESSION_COOKIE_NAME}=${sessionToken}`
            }
            if (origin) headersList.Origin = origin
            if (userAgent) headersList['User-Agent'] = userAgent
            if (forwardedFor) headersList['X-Forwarded-For'] = forwardedFor
        } catch (err) {
            console.error('Error loading next/headers on server side:', err)
        }
    }

    const baseUrl = BACKEND_URL?.endsWith('/')
        ? BACKEND_URL.slice(0, -1)
        : BACKEND_URL
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    const url = `${baseUrl}${cleanPath}`

    const response = await fetch(url, {
        ...init,
        headers: {
            ...headersList,
            ...init?.headers
        },
        credentials: 'include',
        cache: 'no-store'
    })

    if (
        !isServer &&
        response.status === 401 &&
        globalThis.location.pathname !== '/unauthorized'
    ) {
        globalThis.location.href = '/unauthorized'
    }

    return response
}
