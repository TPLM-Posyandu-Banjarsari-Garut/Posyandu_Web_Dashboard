'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

export default function QueryProvider({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000, // 1 minute
                        refetchOnWindowFocus: false
                    }
                }
            })
    )

    useEffect(() => {
        if (
            typeof window === 'undefined' ||
            !window.location.pathname.startsWith('/dashboard')
        ) {
            return
        }

        const THREE_HOURS_MS = 3 * 60 * 60 * 1000
        const THREE_AND_A_HALF_HOURS_MS = 3.5 * 60 * 60 * 1000

        const updateActivity = () => {
            const now = Date.now()
            const lastActivityStr = localStorage.getItem(
                'dashboard_last_activity'
            )

            if (lastActivityStr) {
                const lastActivity = Number(lastActivityStr)
                const idleTime = now - lastActivity

                if (
                    idleTime >= THREE_HOURS_MS &&
                    idleTime < THREE_AND_A_HALF_HOURS_MS
                ) {
                    console.log(
                        'User active after 3 hours idle, renewing session token...'
                    )
                    fetch('/api/auth/session?refresh=true', {
                        credentials: 'include'
                    })
                        .then(res => {
                            if (res.ok) {
                                console.log(
                                    'Session token successfully renewed.'
                                )
                            }
                        })
                        .catch(err =>
                            console.error('Failed to renew session token:', err)
                        )
                } else if (idleTime >= THREE_AND_A_HALF_HOURS_MS) {
                    localStorage.removeItem('dashboard_last_activity')
                    window.location.href = '/unauthorized'
                    return
                }
            }

            localStorage.setItem('dashboard_last_activity', String(now))
        }

        // Initialize last activity if not exists
        if (!localStorage.getItem('dashboard_last_activity')) {
            localStorage.setItem('dashboard_last_activity', String(Date.now()))
        }

        // Periodically check if session cookies were cleared manually in DevTools
        const checkCookieInterval = setInterval(() => {
            if (
                typeof document !== 'undefined' &&
                window.location.pathname.startsWith('/dashboard')
            ) {
                const cookiesList = document.cookie.split(';')
                const hasSessionActive = cookiesList.some(c =>
                    c.trim().startsWith('session_active=')
                )
                if (!hasSessionActive) {
                    console.warn(
                        'Session cookie cleared by user/browser. Redirecting...'
                    )
                    clearInterval(checkCookieInterval)
                    window.location.href = '/unauthorized'
                }
            }
        }, 2000)

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
        const handleEvent = () => {
            const now = Date.now()
            const lastUpdate = Number(
                localStorage.getItem('dashboard_last_activity_update') || '0'
            )
            if (now - lastUpdate > 10000) {
                // Throttle updates to once every 10 seconds
                localStorage.setItem(
                    'dashboard_last_activity_update',
                    String(now)
                )
                updateActivity()
            }
        }

        for (const event of events) {
            window.addEventListener(event, handleEvent, { passive: true })
        }

        return () => {
            clearInterval(checkCookieInterval)
            for (const event of events) {
                window.removeEventListener(event, handleEvent)
            }
        }
    }, [])

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}
