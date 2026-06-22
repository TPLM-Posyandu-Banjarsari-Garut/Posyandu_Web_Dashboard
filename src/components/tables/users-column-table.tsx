'use client'

import { DotsThree, PencilSimple, Trash } from '@phosphor-icons/react'
import type { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useDeleteUser } from '@/hooks/use-users'

export interface User {
    id: string
    name: string
    email: string
    email_verified?: boolean
    phone_number?: string | null
    avatar_url?: string | null
    role: 'posyandu_admin' | 'village_admin' | 'parent' | 'cadre' | 'midwife'
    status: 'active' | 'inactive' | 'disabled' | 'pending_verification'
    createdAt?: string
    updatedAt?: string
}

function ActionCell({
    user,
    onEdit
}: {
    user: User
    onEdit: (user: User) => void
}) {
    const deleteMutation = useDeleteUser()

    const handleDelete = async () => {
        if (
            globalThis.confirm(
                `Are you sure you want to delete user "${user.name}"?`
            )
        ) {
            try {
                await deleteMutation.mutateAsync({ publicId: user.id })
                toast.success(`Successfully deleted user "${user.name}"`)
            } catch (err) {
                const error = err as Error
                toast.error(error.message || 'Failed to delete user')
            }
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant='ghost'
                    className='h-8 w-8 p-0'
                    disabled={deleteMutation.isPending}
                >
                    <span className='sr-only'>Open menu</span>
                    <DotsThree className='h-4 w-4' />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-40 font-mono'>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => onEdit(user)}
                    className='cursor-pointer flex items-center gap-2'
                >
                    <PencilSimple className='h-4 w-4' />
                    Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className='cursor-pointer text-red-600 dark:text-red-400 flex items-center gap-2 focus:text-red-600'
                >
                    <Trash className='h-4 w-4' />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export const getColumns = (onEdit: (user: User) => void): ColumnDef<User>[] => [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={value =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label='Select all'
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={value => row.toggleSelected(!!value)}
                aria-label='Select row'
            />
        ),
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'avatar_url',
        header: 'Photo',
        cell: ({ row }) => {
            const avatarUrl = row.getValue<string | null>('avatar_url')
            const name = row.getValue<string>('name')
            const initials = name
                ? name
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()
                : 'U'
            return (
                <Avatar className='h-8 w-8 rounded-full'>
                    <AvatarImage src={avatarUrl ?? undefined} alt={name} />
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
            )
        }
    },
    {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => {
            return (
                <span className='font-medium text-foreground'>
                    {row.getValue('name')}
                </span>
            )
        }
    },
    {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => row.getValue('email')
    },
    {
        accessorKey: 'phone_number',
        header: 'Phone',
        cell: ({ row }) => row.getValue('phone_number') || '-'
    },
    {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => {
            const role = row.getValue<User['role']>('role')
            const roleColors: Record<User['role'], string> = {
                posyandu_admin:
                    'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 hover:bg-red-500/20',
                village_admin:
                    'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20',
                midwife:
                    'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 hover:bg-purple-500/20',
                cadre: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 hover:bg-green-500/20',
                parent: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
            }
            const roleLabels: Record<User['role'], string> = {
                posyandu_admin: 'Posyandu Admin',
                village_admin: 'Village Admin',
                midwife: 'Midwife',
                cadre: 'Cadre',
                parent: 'Parent'
            }
            return (
                <Badge variant='outline' className={roleColors[role]}>
                    {roleLabels[role] || role}
                </Badge>
            )
        }
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue<User['status']>('status')
            const statusColors: Record<User['status'], string> = {
                active: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
                inactive:
                    'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
                disabled:
                    'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
                pending_verification:
                    'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20'
            }
            const statusLabels: Record<User['status'], string> = {
                active: 'Active',
                inactive: 'Inactive',
                disabled: 'Disabled',
                pending_verification: 'Pending'
            }
            return (
                <Badge variant='outline' className={statusColors[status]}>
                    {statusLabels[status] || status}
                </Badge>
            )
        }
    },
    {
        id: 'actions',
        cell: ({ row }) => <ActionCell user={row.original} onEdit={onEdit} />
    }
]
