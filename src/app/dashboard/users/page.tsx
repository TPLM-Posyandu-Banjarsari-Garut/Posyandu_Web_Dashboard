'use client'

import { toast } from 'sonner'
import { DashboardTitle } from '@/components/dashboard/dashboard-title'
import { DataTable } from '@/components/tables/data-table'
import { columns, type User } from '@/components/tables/users-column-table'
import { useDeleteUser, useUsers } from '@/hooks/use-users'

export default function UsersPage() {
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

    return (
        <>
            <DashboardTitle
                title='Users'
                subtitle='Manage Posyandu system users data'
            />

            <section className='mt-6'>
                <DataTable
                    columns={columns}
                    data={usersResponse?.data || []}
                    isLoading={isLoading || deleteMutation.isPending}
                    isFetching={isFetching}
                    onRefresh={handleRefresh}
                    onDelete={handleDelete}
                    config={{
                        enableSorting: true,
                        enableFiltering: true,
                        enableColumnVisibility: true
                    }}
                />
            </section>
        </>
    )
}
