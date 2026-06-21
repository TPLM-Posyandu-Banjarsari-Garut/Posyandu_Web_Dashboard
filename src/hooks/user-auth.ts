import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { z } from 'zod'
import { ALLOWED_ROLES, BACKEND_URL } from '@/constants/constants'
import type { SessionData } from '@/types/auth-type'
import type zodSignInInput from '@/validations/zod-SignInInput'

type LoginInput = z.infer<typeof zodSignInInput>

export function useSession() {
    return useQuery<SessionData | null>({
        queryKey: ['session'],
        queryFn: async () => {
            try {
                const response = await fetch(
                    `${BACKEND_URL}/api/auth/get-session`,
                    {
                        headers: {
                            Accept: 'application/json'
                        }
                    }
                )
                if (!response.ok) return null
                const data = await response.json()
                if (!data?.user || !ALLOWED_ROLES.has(data.user.role)) {
                    return null
                }
                return data
            } catch (err) {
                console.error('Fetch session hook error:', err)
                return null
            }
        },
        staleTime: 5 * 60 * 1000 // 5 minutes cache
    })
}

export function useLogin() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (credentials: LoginInput) => {
            const response = await fetch(
                `${BACKEND_URL}/api/auth/sign-in/email`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(credentials)
                }
            )

            const data = await response.json().catch(() => null)

            if (!response.ok) {
                throw new Error(data?.message || 'Email atau password salah.')
            }

            const user = data?.user
            if (!user || !ALLOWED_ROLES.has(user.role)) {
                // If not an admin, immediately log out on the server
                const sessionToken = data?.token
                const cookiesHeader = response.headers.get('set-cookie')

                await fetch(`${BACKEND_URL}/api/auth/sign-out`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${sessionToken}`,
                        Cookie: cookiesHeader || ''
                    }
                }).catch(err =>
                    console.error('Signout failed for unauthorized user:', err)
                )

                throw new Error('UNAUTHORIZED_ROLE')
            }

            return data
        },
        onSuccess: data => {
            queryClient.setQueryData(['session'], data)
        }
    })
}

export function useLogout() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async () => {
            const response = await fetch(`${BACKEND_URL}/api/auth/sign-out`, {
                method: 'POST'
            })
            if (!response.ok) {
                throw new Error('Gagal melakukan log-out.')
            }
            return true
        },
        onSuccess: () => {
            queryClient.setQueryData(['session'], null)
            globalThis.location.href = '/login'
        }
    })
}
