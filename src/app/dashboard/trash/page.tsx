'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { columns } from '@/components/columns-table/trash-column-table'
import { DashboardTitle } from '@/components/dashboard/dashboard-title'
import { DataTable } from '@/components/tables/data-table'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { typeOptions } from '@/constants/constants'
import { useHardDeleteTrashItem, useTrash } from '@/hooks/use-trash'
import type { TrashItem } from '@/types/trash'

export default function TrashPage() {
    const [page, setPage] = useState(1)
    const [limit] = useState(10)
    const [search, setSearch] = useState('')
    const [selectedType, setSelectedType] = useState<string>('all')

    const typeFilter =
        selectedType === 'all' ? undefined : (selectedType as TrashItem['type'])

    const hardDeleteMutation = useHardDeleteTrashItem()

    const {
        data: trashResponse,
        isLoading,
        isFetching,
        refetch
    } = useTrash({
        page,
        limit,
        type: typeFilter,
        search: search || undefined
    })

    const handleRefresh = async () => {
        try {
            await refetch()
            toast.success('Trash items list refreshed successfully')
        } catch (err) {
            const error = err as Error
            toast.error(error.message || 'Failed to refresh trash items')
        }
    }

    const handleBulkHardDelete = async (selectedItems: TrashItem[]) => {
        try {
            await Promise.all(
                selectedItems.map(item =>
                    hardDeleteMutation.mutateAsync({
                        type: item.type,
                        publicId: item.id
                    })
                )
            )
            toast.success(
                `Successfully permanently deleted ${selectedItems.length} items`
            )
        } catch (err) {
            const error = err as Error
            toast.error(error.message || 'Failed to permanently delete items')
        }
    }

    const totalPages = trashResponse?.meta.total_pages
        ? Number(trashResponse.meta.total_pages)
        : 1

    return (
        <>
            <DashboardTitle
                title='Trash Bin'
                subtitle='Restore or permanently delete inactive and deleted records'
            />

            <section className='mt-6'>
                <DataTable
                    columns={columns}
                    data={trashResponse?.data || []}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    onRefresh={handleRefresh}
                    onDelete={handleBulkHardDelete}
                    deleteLabel='Delete Permanently'
                    pageCount={totalPages}
                    pagination={{
                        pageIndex: page - 1,
                        pageSize: limit
                    }}
                    onPaginationChange={updater => {
                        if (typeof updater === 'function') {
                            const newState = updater({
                                pageIndex: page - 1,
                                pageSize: limit
                            })
                            setPage(newState.pageIndex + 1)
                        } else {
                            setPage(updater.pageIndex + 1)
                        }
                    }}
                    config={{
                        enableSorting: false,
                        enableFiltering: false,
                        enableColumnVisibility: true,
                        serverSide: true
                    }}
                    toolbarLeft={
                        <>
                            <Input
                                placeholder='Search deleted items...'
                                value={search}
                                onChange={e => {
                                    setSearch(e.target.value)
                                    setPage(1)
                                }}
                                className='flex-1 rounded-none h-8 font-mono max-w-[240px]'
                            />
                            <Select
                                value={selectedType}
                                onValueChange={val => {
                                    setSelectedType(val)
                                    setPage(1)
                                }}
                            >
                                <SelectTrigger className='w-[160px] rounded-none h-8 font-mono'>
                                    <SelectValue placeholder='Filter by Type' />
                                </SelectTrigger>
                                <SelectContent className='rounded-none font-mono max-h-[300px] overflow-y-auto'>
                                    {typeOptions.map(opt => (
                                        <SelectItem
                                            key={opt.value}
                                            value={opt.value}
                                        >
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </>
                    }
                />
            </section>
        </>
    )
}
