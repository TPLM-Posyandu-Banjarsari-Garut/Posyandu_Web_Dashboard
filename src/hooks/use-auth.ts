import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { z } from 'zod'
import type { SessionData } from '@/types/auth'
import type zodSignInInput from '@/validations/zod-SignInInput'

type LoginInput = z.infer<typeof zodSignInInput>

export function useSession() {
    return useQuery<SessionData | null>({
        queryKey: ['session'],
        queryFn: async () => {
            try {
                const response = await fetch('/api/auth/session', {
                    headers: {
                        Accept: 'application/json'
                    },
                    credentials: 'include'
                })
                if (!response.ok) return null
                const data = await response.json()
                if (!data?.user) return null
                return data
            } catch (err) {
                console.error('Fetch session hook error:', err)
                return null
            }
        },
        staleTime: 5 * 60 * 1000
    })
}

export function useLogin() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (credentials: LoginInput) => {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials),
                credentials: 'include'
            })

            const data = await response.json().catch(() => null)

            if (!response.ok) {
                throw new Error(data?.message || 'Incorrect email or password.')
            }

            return data
        },
        onSuccess: data => {
            queryClient.setQueryData(['session'], data)
            if (globalThis.window !== undefined) {
                localStorage.setItem(
                    'dashboard_last_activity',
                    String(Date.now())
                )
                localStorage.setItem(
                    'dashboard_last_activity_update',
                    String(Date.now())
                )
            }
        }
    })
}

export function useLogout() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async () => {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            })
            if (!response.ok) {
                throw new Error('Failed to log out.')
            }
            return true
        },
        onSuccess: () => {
            queryClient.setQueryData(['session'], null)
            if (typeof window !== 'undefined') {
                localStorage.removeItem('dashboard_last_activity')
                localStorage.removeItem('dashboard_last_activity_update')
            }
            globalThis.location.href = '/'
        }
    })
}
