import type { QueryKey } from '@tanstack/react-query'
import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient
} from '@tanstack/react-query'
import type { z } from 'zod'
import type { User } from '@/components/columns-table/users-column-table'
import { apiClient } from '@/lib/api-client'
import type { PaginatedResponse } from '@/types'
import type { UserQueryParams } from '@/types/users'
import type zodCreateUserInput from '@/validations/zod-CreateUserInput'
import type zodUpdateUserInput from '@/validations/zod-UpdateUserInput'

type CreateUserInput = z.infer<typeof zodCreateUserInput>
type UpdateUserInput = z.infer<typeof zodUpdateUserInput>

export type UsersResponse = PaginatedResponse<User>

export const userKeys = {
    all: ['users'] as const,
    lists: () => [...userKeys.all, 'list'] as const,
    list: (params: UserQueryParams) => [...userKeys.lists(), params] as const,
    details: () => [...userKeys.all, 'detail'] as const,
    detail: (id: string) => [...userKeys.details(), id] as const
}

export function useUsers(params?: UserQueryParams) {
    const {
        page = 1,
        limit = 10,
        order = 'desc',
        status = 'active',
        includeDeleted = 'false',
        ...rest
    } = params || {}

    const { search, role, ...otherRest } = rest

    return useQuery<UsersResponse>({
        queryKey: userKeys.list({
            page,
            limit,
            order,
            status,
            includeDeleted,
            search,
            role,
            ...otherRest
        }),
        queryFn: async () => {
            const queryParamsObj = new URLSearchParams()
            queryParamsObj.append('page', String(page))
            queryParamsObj.append('limit', String(limit))
            queryParamsObj.append('order', order)
            queryParamsObj.append('includeDeleted', includeDeleted)
            if (status) queryParamsObj.append('status', status)
            if (search) queryParamsObj.append('search', search)
            if (role) queryParamsObj.append('role', role)

            for (const [key, value] of Object.entries(otherRest)) {
                if (value !== undefined && value !== '') {
                    queryParamsObj.append(key, String(value))
                }
            }
            const response = await apiClient(
                `/api/users?${queryParamsObj.toString()}`
            )
            if (!response.ok) {
                const errorData = await response.json().catch(() => null)
                throw new Error(errorData?.message || 'Failed to fetch users')
            }
            const result = await response.json()
            return result.data
        },
        staleTime: 5 * 60 * 1000,
        placeholderData: keepPreviousData
    })
}

export function useUserDetail(publicId: string) {
    return useQuery<User>({
        queryKey: userKeys.detail(publicId),
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
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.lists() })
        }
    })
}

export function useUpdateUser() {
    const queryClient = useQueryClient()

    return useMutation<
        User,
        Error,
        { publicId: string; payload: UpdateUserInput },
        { previousData: [readonly unknown[], unknown][] }
    >({
        mutationFn: async ({ publicId, payload }) => {
            if (payload.status === 'inactive') {
                const response = await apiClient(`/api/users/${publicId}`, {
                    method: 'DELETE'
                })
                const data = await response.json().catch(() => null)
                if (!response.ok) {
                    throw new Error(
                        data?.message || 'Failed to move user to trash'
                    )
                }
                return data
            }

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
        onMutate: async ({ publicId, payload }) => {
            await queryClient.cancelQueries({ queryKey: userKeys.lists() })
            const previousData = queryClient.getQueriesData({
                queryKey: userKeys.lists()
            })

            queryClient.setQueriesData<UsersResponse>(
                { queryKey: userKeys.lists() },
                old => {
                    if (!old) return old

                    if (payload.status === 'inactive') {
                        return {
                            ...old,
                            data: old.data.filter(u => u.id !== publicId)
                        }
                    }

                    return {
                        ...old,
                        data: old.data.map(u =>
                            u.id === publicId
                                ? { ...u, ...(payload as Partial<User>) }
                                : u
                        )
                    }
                }
            )

            return { previousData }
        },
        onError: (_err, _vars, context) => {
            if (context?.previousData) {
                for (const [key, data] of context.previousData) {
                    queryClient.setQueryData(key as QueryKey, data)
                }
            }
        },
        onSuccess: (updatedUser, variables) => {
            queryClient.setQueryData(
                userKeys.detail(variables.publicId),
                updatedUser
            )
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.lists() })
        }
    })
}

export function useDeleteUser() {
    const queryClient = useQueryClient()

    return useMutation<
        boolean,
        Error,
        { publicId: string; permanent?: boolean },
        { previousData: [readonly unknown[], unknown][] }
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
        onMutate: async ({ publicId }) => {
            await queryClient.cancelQueries({ queryKey: userKeys.lists() })
            const previousData = queryClient.getQueriesData({
                queryKey: userKeys.lists()
            })

            queryClient.setQueriesData<UsersResponse>(
                { queryKey: userKeys.lists() },
                old => {
                    if (!old) return old
                    return {
                        ...old,
                        data: old.data.filter(u => u.id !== publicId)
                    }
                }
            )

            return { previousData }
        },
        onError: (_err, _vars, context) => {
            if (context?.previousData) {
                for (const [key, data] of context.previousData) {
                    queryClient.setQueryData(key as QueryKey, data)
                }
            }
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: userKeys.lists() })
            queryClient.removeQueries({
                queryKey: userKeys.detail(variables.publicId)
            })
        }
    })
}
