import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { z } from 'zod'
import type { User } from '@/components/tables/users-column-table'
import { apiClient } from '@/lib/api-client'
import type { PaginatedResponse } from '@/types'
import type { UserQueryParams } from '@/types/users'
import type zodCreateUserInput from '@/validations/zod-CreateUserInput'
import type zodUpdateUserInput from '@/validations/zod-UpdateUserInput'

type CreateUserInput = z.infer<typeof zodCreateUserInput>
type UpdateUserInput = z.infer<typeof zodUpdateUserInput>

export type UsersResponse = PaginatedResponse<User>

export function useUsers(params?: UserQueryParams) {
    const {
        page = 1,
        limit = 10,
        order = 'desc',
        includeDeleted = 'false',
        ...rest
    } = params || {}

    return useQuery<UsersResponse>({
        queryKey: ['users', { page, limit, order, includeDeleted, ...rest }],
        queryFn: async () => {
            const queryParams = new URLSearchParams()
            queryParams.append('page', String(page))
            queryParams.append('limit', String(limit))
            queryParams.append('order', order)
            queryParams.append('includeDeleted', includeDeleted)

            for (const [key, value] of Object.entries(rest)) {
                if (value !== undefined && value !== '') {
                    queryParams.append(key, value as string)
                }
            }
            const response = await apiClient(
                `/api/users?${queryParams.toString()}`
            )
            if (!response.ok) {
                const errorData = await response.json().catch(() => null)
                throw new Error(errorData?.message || 'Failed to fetch users')
            }
            const result = await response.json()
            return result.data
        },
        staleTime: 30 * 1000,
        refetchInterval: 10 * 1000
    })
}

export function useUserDetail(publicId: string) {
    return useQuery<User>({
        queryKey: ['users', publicId],
        queryFn: async () => {
            const response = await apiClient(`/api/users/${publicId}`)
            if (!response.ok) {
                const errorData = await response.json().catch(() => null)
                throw new Error(
                    errorData?.message || 'Failed to fetch user details'
                )
            }
            return response.json()
        },
        staleTime: 5 * 60 * 1000,
        enabled: !!publicId
    })
}

export function useCreateUser() {
    const queryClient = useQueryClient()

    return useMutation<User, Error, CreateUserInput>({
        mutationFn: async payload => {
            const response = await apiClient('/api/users', {
                method: 'POST',
                body: JSON.stringify(payload)
            })
            const data = await response.json().catch(() => null)
            if (!response.ok) {
                throw new Error(data?.message || 'Failed to create user')
            }
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            queryClient.refetchQueries({ queryKey: ['users'] })
        }
    })
}

export function useUpdateUser() {
    const queryClient = useQueryClient()

    return useMutation<
        User,
        Error,
        { publicId: string; payload: UpdateUserInput }
    >({
        mutationFn: async ({ publicId, payload }) => {
            const response = await apiClient(`/api/users/${publicId}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            })
            const data = await response.json().catch(() => null)
            if (!response.ok) {
                throw new Error(data?.message || 'Failed to update user')
            }
            return data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            queryClient.refetchQueries({ queryKey: ['users'] })
            queryClient.invalidateQueries({
                queryKey: ['users', variables.publicId]
            })
        }
    })
}

export function useDeleteUser() {
    const queryClient = useQueryClient()

    return useMutation<
        boolean,
        Error,
        { publicId: string; permanent?: boolean }
    >({
        mutationFn: async ({ publicId, permanent }) => {
            const queryParams = new URLSearchParams()
            if (permanent !== undefined) {
                queryParams.append('permanent', String(permanent))
            }
            const response = await apiClient(
                `/api/users/${publicId}?${queryParams.toString()}`,
                {
                    method: 'DELETE'
                }
            )
            const data = await response.json().catch(() => null)
            if (!response.ok) {
                throw new Error(data?.message || 'Failed to delete user')
            }
            return true
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            queryClient.refetchQueries({ queryKey: ['users'] })
        }
    })
}
