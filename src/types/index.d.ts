export interface PaginatedResponse<T> {
    data: T[]
    meta: {
        page: string | number
        limit: string | number
        total_items: number
        total_pages: number
    }
}
