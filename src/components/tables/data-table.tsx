'use client'

import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable
} from '@tanstack/react-table'
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from '@/components/ui/empty'
import {
    Pagination,
    PaginationContent,
    PaginationItem,
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

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    showPagination?: boolean
    isLoading?: boolean
}

export function DataTable<TData, TValue>({
    columns,
    data,
    showPagination = true,
    isLoading = false
}: Readonly<DataTableProps<TData, TValue>>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: showPagination
            ? getPaginationRowModel()
            : undefined
    })

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
            >
                {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                        {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                        )}
                    </TableCell>
                ))}
            </TableRow>
        ))
    }

    return (
        <div className='space-y-4'>
            <div className='border border-border bg-card text-card-foreground shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500'>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext()
                                                  )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>{renderTableBody()}</TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {showPagination && table.getPageCount() > 1 && (
                <div className='flex items-center justify-between py-4'>
                    <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
                        <p>Rows per page</p>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={value => {
                                table.setPageSize(Number(value))
                            }}
                        >
                            <SelectTrigger className='h-8 w-[70px]'>
                                <SelectValue
                                    placeholder={
                                        table.getState().pagination.pageSize
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent side='top'>
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

                    <div className='flex flex-1 items-center justify-end space-x-6 lg:space-x-8'>
                        <div className='flex w-[100px] items-center justify-center text-sm font-medium'>
                            Page {table.getState().pagination.pageIndex + 1} of{' '}
                            {table.getPageCount()}
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
                                                ? 'cursor-pointer'
                                                : 'pointer-events-none opacity-50'
                                        }
                                    />
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationNext
                                        href='#'
                                        onClick={e => {
                                            e.preventDefault()
                                            table.nextPage()
                                        }}
                                        className={
                                            table.getCanNextPage()
                                                ? 'cursor-pointer'
                                                : 'pointer-events-none opacity-50'
                                        }
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </div>
            )}
        </div>
    )
}
