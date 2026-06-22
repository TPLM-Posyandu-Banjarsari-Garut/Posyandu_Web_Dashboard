import type { OnChangeFn, PaginationState } from '@tanstack/react-table'

export interface PaginationMeta {
    total: number
    page: number
    pageSize: number
    totalPages: number
}

export interface DataTableConfig {
    /**
     * Determines whether to use server-side pagination.
     * If true, pagination must be controlled externally.
     */
    serverSide?: boolean
    /**
     * Enables client-side or server-side sorting features.
     */
    enableSorting?: boolean
    /**
     * Enables filtering features (search input and/or column filters).
     */
    enableFiltering?: boolean
    /**
     * Enables column visibility toggles.
     */
    enableColumnVisibility?: boolean
}

export interface ServerPaginationProps {
    /**
     * Total number of pages for server-side pagination.
     */
    pageCount?: number
    /**
     * Current pagination state (controlled externally for server-side pagination).
     */
    pagination?: PaginationState
    /**
     * Callback when pagination state changes (controlled externally).
     */
    onPaginationChange?: OnChangeFn<PaginationState>
}
