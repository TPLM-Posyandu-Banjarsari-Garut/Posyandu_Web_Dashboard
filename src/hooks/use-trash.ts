import type { QueryKey } from '@tanstack/react-query'
import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient
} from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { PaginatedResponse } from '@/types'
import type { TrashItem, TrashQueryFilters } from '@/types/trash'

export type TrashResponse = PaginatedResponse<TrashItem>

const typeEndpointMap: Record<TrashItem['type'], string> = {
    user: 'users',
    children: 'childrens',
    posyandu: 'posyandus',
    education: 'educations',
    education_category: 'education-categories',
    vaccine: 'vaccines',
    vitamin: 'vitamins',
    pregnancy_record: 'pregnancy-records',
    nutrition_record: 'nutrition-records',
    vitamin_record: 'vitamin-records',
    immunization_record: 'immunization-records',
    kipi_detail: 'kipi-details',
    examination_schedule: 'examination-schedules',
    examination_record: 'examination-records',
    examination: 'examinations',
    inventory: 'inventories'
}

export const trashKeys = {
    all: ['trash'] as const,
    lists: () => [...trashKeys.all, 'list'] as const,
    list: (params: TrashQueryFilters) => [...trashKeys.lists(), params] as const
}

export function useTrash(params?: TrashQueryFilters) {
    const { page = 1, limit = 10, order = 'desc', type, search } = params || {}

    return useQuery<TrashResponse>({
        queryKey: trashKeys.list({ page, limit, order, type, search }),
        queryFn: async () => {
            const queryParams = new URLSearchParams()
            queryParams.append('page', String(page))
            queryParams.append('limit', String(limit))
            queryParams.append('order', order)
            if (type) queryParams.append('type', type)
            if (search) queryParams.append('search', search)

            const response = await apiClient(
                `/api/trash?${queryParams.toString()}`
            )
            if (!response.ok) {
                const errorData = await response.json().catch(() => null)
                throw new Error(
                    errorData?.message || 'Failed to fetch trash items'
                )
            }
            const result = await response.json()
            return result.data
        },
        staleTime: 5 * 60 * 1000,
        placeholderData: keepPreviousData
    })
}

export function useRestoreTrashItem() {
    const queryClient = useQueryClient()

    return useMutation<
        boolean,
        Error,
        { type: TrashItem['type']; publicId: string },
        { previousData: [readonly unknown[], unknown][] }
    >({
        mutationFn: async ({ type, publicId }) => {
            const response = await apiClient(
                `/api/trash/${type}/${publicId}/restore`,
                {
                    method: 'POST'
                }
            )
            const data = await response.json().catch(() => null)
            if (!response.ok) {
                throw new Error(data?.message || 'Failed to restore item')
            }
            return true
        },
        onMutate: async ({ publicId }) => {
            await queryClient.cancelQueries({ queryKey: trashKeys.lists() })
            const previousData = queryClient.getQueriesData({
                queryKey: trashKeys.lists()
            })

            queryClient.setQueriesData<TrashResponse>(
                { queryKey: trashKeys.lists() },
                old => {
                    if (!old) return old
                    return {
                        ...old,
                        data: old.data.filter(item => item.id !== publicId)
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
            queryClient.invalidateQueries({ queryKey: trashKeys.lists() })
            const entityKey = typeEndpointMap[variables.type]
            if (entityKey) {
                queryClient.invalidateQueries({ queryKey: [entityKey] })
            }
        }
    })
}

export function useHardDeleteTrashItem() {
    const queryClient = useQueryClient()

    return useMutation<
        boolean,
        Error,
        { type: TrashItem['type']; publicId: string },
        { previousData: [readonly unknown[], unknown][] }
    >({
        mutationFn: async ({ type, publicId }) => {
            const endpoint = typeEndpointMap[type]
            if (!endpoint) {
                throw new Error(`Unsupported entity type: ${type}`)
            }

            const response = await apiClient(
                `/api/${endpoint}/${publicId}?permanent=true`,
                {
                    method: 'DELETE'
                }
            )
            const data = await response.json().catch(() => null)
            if (!response.ok) {
                throw new Error(
                    data?.message || 'Failed to permanently delete item'
                )
            }
            return true
        },
        onMutate: async ({ publicId }) => {
            await queryClient.cancelQueries({ queryKey: trashKeys.lists() })
            const previousData = queryClient.getQueriesData({
                queryKey: trashKeys.lists()
            })

            queryClient.setQueriesData<TrashResponse>(
                { queryKey: trashKeys.lists() },
                old => {
                    if (!old) return old
                    return {
                        ...old,
                        data: old.data.filter(item => item.id !== publicId)
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
            queryClient.invalidateQueries({ queryKey: trashKeys.lists() })
            const entityKey = typeEndpointMap[variables.type]
            if (entityKey) {
                queryClient.invalidateQueries({ queryKey: [entityKey, 'list'] })
                queryClient.removeQueries({
                    queryKey: [entityKey, 'detail', variables.publicId]
                })
            }
        }
    })
}
