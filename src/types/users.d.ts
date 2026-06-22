import type { User } from '@/components/tables/users-column-table'

export interface UserQueryParams {
    page?: number | string
    limit?: number | string
    order?: 'asc' | 'desc'
    role?: User['role']
    status?: User['status']
    search?: string
    includeDeleted?: 'true' | 'false'
}
