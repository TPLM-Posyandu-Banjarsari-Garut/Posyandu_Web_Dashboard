'use client'

import { Plus } from '@phosphor-icons/react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
    getColumns,
    type User
} from '@/components/columns-table/users-column-table'
import { DashboardTitle } from '@/components/dashboard/dashboard-title'
import { UsersSheet } from '@/components/dashboard/users-sheet'
import { DataTable } from '@/components/tables/data-table'
import { Button } from '@/components/ui/button'
import { useDeleteUser, useUsers } from '@/hooks/use-users'

export default function UsersPage() {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)

    const {
        data: usersResponse,
        isLoading,
        isFetching,
        refetch
    } = useUsers({
        page: 1,
        limit: 10,
        order: 'desc',
        includeDeleted: 'false'
    })

    const deleteMutation = useDeleteUser()

    const handleRefresh = async () => {
        try {
            await refetch()
            toast.success('User list refreshed successfully')
        } catch (err) {
            const error = err as Error
            toast.error(error.message || 'Failed to refresh user list')
        }
    }

    const handleDelete = async (selectedUsers: User[]) => {
        if (
            globalThis.confirm(
                `Are you sure you want to delete ${selectedUsers.length} user(s)?`
            )
        ) {
            try {
                for (const user of selectedUsers) {
                    await deleteMutation.mutateAsync({ publicId: user.id })
                }
                toast.success('Successfully deleted selected users')
            } catch (err) {
                const error = err as Error
                toast.error(error.message || 'Failed to delete users')
            }
        }
    }

    const handleEdit = (user: User) => {
        setSelectedUser(user)
        setIsOpen(true)
    }

    const handleCreate = () => {
        setSelectedUser(null)
        setIsOpen(true)
    }

    const columns = getColumns(handleEdit)

    return (
        <>
            <div className='flex items-center justify-between'>
                <DashboardTitle
                    title='Users'
                    subtitle='Manage Posyandu system users data'
                />
                <Button onClick={handleCreate}>
                    <Plus className='h-4 w-4' />
                    Add New User
                </Button>
            </div>

            <section className='mt-6'>
                <DataTable
                    columns={columns}
                    data={usersResponse?.data || []}
                    isLoading={isLoading || deleteMutation.isPending}
                    isFetching={isFetching}
                    onRefresh={handleRefresh}
                    onDelete={handleDelete}
                    onRowClick={handleEdit}
                    config={{
                        enableSorting: true,
                        enableFiltering: true,
                        enableColumnVisibility: true
                    }}
                />
            </section>

            <UsersSheet
                open={isOpen}
                onOpenChange={setIsOpen}
                user={selectedUser}
            />
        </>
    )
}
