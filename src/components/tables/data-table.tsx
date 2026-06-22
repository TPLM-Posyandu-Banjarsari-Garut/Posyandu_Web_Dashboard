'use client'

import {
    ArrowClockwise,
    ArrowsDownUp,
    CaretDown,
    CaretUp,
    SlidersHorizontal,
    Trash
} from '@phosphor-icons/react'
import {
    type ColumnDef,
    type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type Header,
    type OnChangeFn,
    type PaginationState,
    type SortingState,
    type Table as TanstackTable,
    useReactTable,
    type VisibilityState
} from '@tanstack/react-table'
import { useCallback, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from '@/components/ui/pagination'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { DataTableConfig } from '@/types/data-table'

interface BaseDataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    showPagination?: boolean
    isLoading?: boolean
    isFetching?: boolean
    onRefresh?: () => void
    onDelete?: (selectedItems: TData[]) => void
    deleteLabel?: string
    onRowClick?: (row: TData) => void
    toolbarLeft?: React.ReactNode
}

type DataTableProps<TData, TValue> = BaseDataTableProps<TData, TValue> &
    (
        | {
              config: DataTableConfig & { serverSide: true }
              pageCount: number
              pagination: PaginationState
              onPaginationChange: OnChangeFn<PaginationState>
          }
        | {
              config?: DataTableConfig & { serverSide?: false }
              pageCount?: never
              pagination?: never
              onPaginationChange?: never
          }
    )

const coreRowModel = getCoreRowModel()
const paginationRowModel = getPaginationRowModel()
const sortedRowModel = getSortedRowModel()
const filteredRowModel = getFilteredRowModel()

function TableHeaderCell<TData, TValue>({
    header,
    config,
    table
}: Readonly<{
    header: Header<TData, TValue>
    config: DataTableConfig
    table: TanstackTable<TData>
}>) {
    const isSelectColumn = header.column.id === 'select'
    const canSort = header.column.getCanSort() && config.enableSorting

    const handleHeaderClick = useCallback(
        (e: React.MouseEvent) => {
            if (isSelectColumn) {
                const target = e.target as HTMLElement
                if (!target.closest('[data-slot="checkbox"]')) {
                    const hasSelection =
                        table.getIsAllPageRowsSelected() ||
                        table.getIsSomePageRowsSelected()
                    table.toggleAllPageRowsSelected(!hasSelection)
                }
            }
        },
        [isSelectColumn, table]
    )

    const renderSortIcon = () => {
        const sortedState = header.column.getIsSorted()
        if (sortedState === 'asc') {
            return <CaretUp className='ml-2 h-4 w-4 shrink-0' />
        }
        if (sortedState === 'desc') {
            return <CaretDown className='ml-2 h-4 w-4 shrink-0' />
        }
        return <ArrowsDownUp className='ml-2 h-4 w-4 shrink-0 opacity-50' />
    }

    if (header.isPlaceholder) {
        return (
            <TableHead
                className={cn(
                    isSelectColumn &&
                        'sticky left-0 bg-background z-20 shadow-[2px_0_0_0_rgba(0,0,0,0.05)] cursor-pointer'
                )}
            />
        )
    }

    return (
        <TableHead
            className={cn(
                isSelectColumn &&
                    'sticky left-0 bg-background z-20 shadow-[2px_0_0_0_rgba(0,0,0,0.05)] cursor-pointer'
            )}
            onClick={handleHeaderClick}
        >
            {canSort ? (
                <button
                    type='button'
                    onClick={header.column.getToggleSortingHandler()}
                    className='flex items-center hover:text-foreground text-left cursor-pointer select-none font-mono'
                >
                    {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                    )}
                    {renderSortIcon()}
                </button>
            ) : (
                flexRender(header.column.columnDef.header, header.getContext())
            )}
        </TableHead>
    )
}

export function DataTable<TData, TValue>({
    columns,
    data,
    showPagination = true,
    isLoading = false,
    isFetching = false,
    config = {},
    pageCount,
    pagination,
    onPaginationChange,
    onRefresh,
    onDelete,
    deleteLabel,
    onRowClick,
    toolbarLeft
}: Readonly<DataTableProps<TData, TValue>>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
        {}
    )
    const [rowSelection, setRowSelection] = useState({})

    const tableOptions = useMemo(
        () => ({
            data,
            columns,
            autoResetPageIndex: false,
            state: {
                sorting,
                columnFilters,
                globalFilter,
                columnVisibility,
                rowSelection,
                ...(config.serverSide && pagination ? { pagination } : {})
            },
            onRowSelectionChange: setRowSelection,
            onSortingChange: config.enableSorting ? setSorting : undefined,
            onColumnFiltersChange: config.enableFiltering
                ? setColumnFilters
                : undefined,
            onGlobalFilterChange: config.enableFiltering
                ? setGlobalFilter
                : undefined,
            onColumnVisibilityChange: config.enableColumnVisibility
                ? setColumnVisibility
                : undefined,

            getCoreRowModel: coreRowModel,

            ...(config.serverSide
                ? {
                      manualPagination: true,
                      pageCount: pageCount ?? -1,
                      onPaginationChange: onPaginationChange
                  }
                : {
                      getPaginationRowModel: showPagination
                          ? paginationRowModel
                          : undefined
                  }),

            getSortedRowModel: config.enableSorting
                ? sortedRowModel
                : undefined,
            getFilteredRowModel: config.enableFiltering
                ? filteredRowModel
                : undefined
        }),
        [
            data,
            columns,
            sorting,
            columnFilters,
            globalFilter,
            columnVisibility,
            rowSelection,
            config.serverSide,
            config.enableSorting,
            config.enableFiltering,
            config.enableColumnVisibility,
            pagination,
            pageCount,
            onPaginationChange,
            showPagination
        ]
    )

    const table = useReactTable(tableOptions)

    const renderTableBody = () => {
        if (isLoading) {
            return (
                <TableRow>
                    <TableCell
                        colSpan={columns.length}
                        className='h-48 text-center'
                    >
                        <div className='flex w-full flex-col items-center justify-center gap-2'>
                            <Spinner className='size-8 text-muted-foreground' />
                            <p className='text-sm text-muted-foreground'>
                                Loading data...
                            </p>
                        </div>
                    </TableCell>
                </TableRow>
            )
        }

        if (!table.getRowModel().rows?.length) {
            return (
                <TableRow>
                    <TableCell colSpan={columns.length} className='h-48 p-0'>
                        <Empty>
                            <EmptyHeader>
                                <EmptyTitle>No data available</EmptyTitle>
                                <EmptyDescription>
                                    The data you are looking for was not found
                                    or is not yet available.
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    </TableCell>
                </TableRow>
            )
        }

        return table.getRowModel().rows.map(row => (
            <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className={cn(
                    'odd:bg-muted/30 group/row',
                    onRowClick && 'hover:bg-muted/50 transition-colors'
                )}
            >
                {row.getVisibleCells().map(cell => {
                    const isSelectColumn = cell.column.id === 'select'
                    const isActionsColumn = cell.column.id === 'actions'

                    const handleCellClick = (e: React.MouseEvent) => {
                        if (isSelectColumn) {
                            const target = e.target as HTMLElement
                            if (!target.closest('[data-slot="checkbox"]')) {
                                row.toggleSelected()
                            }
                            return
                        }
                        if (isActionsColumn) {
                            return
                        }
                        onRowClick?.(row.original)
                    }

                    return (
                        <TableCell
                            key={cell.id}
                            onClick={handleCellClick}
                            className={cn(
                                isSelectColumn &&
                                    'sticky left-0 bg-background z-10 shadow-[2px_0_0_0_rgba(0,0,0,0.05)] cursor-pointer',
                                isSelectColumn &&
                                    'group-odd/row:bg-muted/30 group-hover/row:bg-muted/50 group-data-[state=selected]/row:bg-muted',
                                onRowClick &&
                                    !isSelectColumn &&
                                    !isActionsColumn &&
                                    'cursor-pointer'
                            )}
                        >
                            {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                            )}
                        </TableCell>
                    )
                })}
            </TableRow>
        ))
    }

    const currentPageIndex = table.getState().pagination.pageIndex
    const totalPages = table.getPageCount()

    const getPageNumbers = useCallback(() => {
        const pages: { id: string; value: number | 'ellipsis' }[] = []
        const currentPage = currentPageIndex + 1

        const addPage = (val: number | 'ellipsis', index: number) => {
            if (val === 'ellipsis') {
                const lastPage = pages[pages.length - 1]
                if (lastPage && lastPage.value === 'ellipsis') {
                    return
                }
            }
            pages.push({
                id: `page-${val}-${index}`,
                value: val
            })
        }

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                addPage(i, i)
            }
        } else {
            addPage(1, 1)

            if (currentPage > 3) {
                addPage('ellipsis', 2)
            }

            const start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)

            for (let i = start; i <= end; i++) {
                if (!pages.some(p => p.value === i)) {
                    addPage(i, i)
                }
            }

            if (currentPage < totalPages - 2) {
                addPage('ellipsis', totalPages - 1)
            }

            if (!pages.some(p => p.value === totalPages)) {
                addPage(totalPages, totalPages)
            }
        }
        return pages
    }, [currentPageIndex, totalPages])

    // biome-ignore lint/correctness/useExhaustiveDependencies: table reference is unstable but fresh via closure
    const handleDelete = useCallback(() => {
        const selectedRows = table
            .getFilteredSelectedRowModel()
            .rows.map(row => row.original)
        onDelete?.(selectedRows)
        setRowSelection({})
    }, [onDelete])

    // biome-ignore lint/correctness/useExhaustiveDependencies: trigger only on rowSelection change
    const selectedRowCount = useMemo(
        () => table.getFilteredSelectedRowModel().rows.length,
        [rowSelection]
    )

    return (
        <div className='space-y-4'>
            {config.enableFiltering ||
            config.enableColumnVisibility ||
            onRefresh ||
            toolbarLeft ? (
                <div className='flex items-center justify-between gap-4'>
                    {toolbarLeft ? (
                        <div className='flex flex-1 items-center gap-3 max-w-lg'>
                            {toolbarLeft}
                        </div>
                    ) : (
                        config.enableFiltering && (
                            <div className='flex flex-1 items-center max-w-sm relative'>
                                <Input
                                    placeholder='Search all columns...'
                                    value={globalFilter}
                                    onChange={event =>
                                        setGlobalFilter(event.target.value)
                                    }
                                    className='w-full'
                                />
                            </div>
                        )
                    )}
                    <div className='flex items-center gap-2 ml-auto'>
                        {onRefresh && (
                            <Button
                                variant='outline'
                                size='xs'
                                onClick={onRefresh}
                                disabled={isLoading}
                                className='rounded-none border border-input text-xs font-mono h-8 flex items-center gap-1.5 px-3'
                            >
                                <ArrowClockwise
                                    className={cn(
                                        'h-4 w-4',
                                        (isLoading || isFetching) &&
                                            'animate-spin'
                                    )}
                                />
                                Refresh
                            </Button>
                        )}
                        {config.enableColumnVisibility && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant='outline'
                                        size='xs'
                                        className='rounded-none border border-input text-xs font-mono h-8 flex items-center gap-1.5 px-3'
                                    >
                                        <SlidersHorizontal className='h-4 w-4' />
                                        Columns
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align='end'
                                    className='w-44 rounded-none font-mono'
                                >
                                    <DropdownMenuLabel>
                                        Toggle Columns
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {table
                                        .getAllColumns()
                                        .filter(column => column.getCanHide())
                                        .map(column => {
                                            return (
                                                <DropdownMenuCheckboxItem
                                                    key={column.id}
                                                    className='capitalize'
                                                    checked={column.getIsVisible()}
                                                    onCheckedChange={value =>
                                                        column.toggleVisibility(
                                                            !!value
                                                        )
                                                    }
                                                >
                                                    {column.id}
                                                </DropdownMenuCheckboxItem>
                                            )
                                        })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            ) : null}

            <div className='border border-border bg-card text-card-foreground shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500'>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableHeaderCell
                                        key={header.id}
                                        header={header}
                                        config={config}
                                        table={table}
                                    />
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>{renderTableBody()}</TableBody>
                </Table>
            </div>

            {showPagination && totalPages > 0 && (
                <div className='flex items-center justify-between py-4'>
                    <div className='flex items-center space-x-2 text-sm text-muted-foreground font-mono'>
                        <p>Rows per page</p>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={value => {
                                table.setPageSize(Number(value))
                            }}
                        >
                            <SelectTrigger className='h-8 w-[70px] rounded-none'>
                                <SelectValue
                                    placeholder={
                                        table.getState().pagination.pageSize
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent
                                side='top'
                                className='rounded-none font-mono'
                            >
                                {[10, 20, 30, 40, 50].map(pageSize => (
                                    <SelectItem
                                        key={pageSize}
                                        value={`${pageSize}`}
                                    >
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='flex flex-1 items-center justify-end space-x-6 lg:space-x-8 font-mono'>
                        <div className='flex w-[100px] items-center justify-center text-sm font-medium'>
                            Page {currentPageIndex + 1} of {totalPages}
                        </div>
                        <Pagination className='mx-0 w-auto'>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href='#'
                                        onClick={e => {
                                            e.preventDefault()
                                            table.previousPage()
                                        }}
                                        className={
                                            table.getCanPreviousPage()
                                                ? 'cursor-pointer rounded-none'
                                                : 'pointer-events-none opacity-50 rounded-none'
                                        }
                                    />
                                </PaginationItem>
                                {getPageNumbers().map(pageItem => (
                                    <PaginationItem key={pageItem.id}>
                                        {pageItem.value === 'ellipsis' ? (
                                            <PaginationEllipsis />
                                        ) : (
                                            <PaginationLink
                                                href='#'
                                                isActive={
                                                    currentPageIndex ===
                                                    (pageItem.value as number) -
                                                        1
                                                }
                                                onClick={e => {
                                                    e.preventDefault()
                                                    table.setPageIndex(
                                                        (pageItem.value as number) -
                                                            1
                                                    )
                                                }}
                                                className='rounded-none cursor-pointer'
                                            >
                                                {pageItem.value}
                                            </PaginationLink>
                                        )}
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext
                                        href='#'
                                        onClick={e => {
                                            e.preventDefault()
                                            table.nextPage()
                                        }}
                                        className={
                                            table.getCanNextPage()
                                                ? 'cursor-pointer rounded-none'
                                                : 'pointer-events-none opacity-50 rounded-none'
                                        }
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </div>
            )}

            {selectedRowCount > 0 && (
                <div className='flex items-center justify-between border border-border bg-muted/60 p-4 font-mono text-sm shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-none mt-4'>
                    <div className='flex items-center gap-2'>
                        <span className='font-bold text-foreground text-base'>
                            {selectedRowCount}
                        </span>
                        <span className='text-muted-foreground'>
                            items selected
                        </span>
                    </div>
                    <div>
                        <Button
                            variant='destructive'
                            size='xs'
                            onClick={handleDelete}
                            className='flex items-center gap-1.5 px-4 h-8 rounded-none'
                        >
                            <Trash className='h-4 w-4' />
                            {deleteLabel ?? 'Move to Trash'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
