'use client'

import { DotsThree, PencilSimple, Trash } from '@phosphor-icons/react'
import type { ColumnDef } from '@tanstack/react-table'
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

export interface Midwife {
    id: string
    name: string // Joined from User
    email: string // Joined from User
    identity_number?: string | null
    employee_number?: string | null
    license_number?: string | null
    is_mtbs_trained?: boolean
    is_kelas_ibu_balita_facilitator?: boolean
    is_pkat_member?: boolean
    is_poned_provider?: boolean
    is_primary_assignment?: boolean
    status: 'active' | 'inactive' | 'disabled' | 'pending_verification'
    createdAt?: string
    updatedAt?: string
}

export const columns: ColumnDef<Midwife>[] = [
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
        accessorKey: 'name',
        header: 'Midwife Name',
        cell: ({ row }) => {
            return (
                <div className='flex flex-col'>
                    <span className='font-medium text-foreground'>
                        {row.getValue('name')}
                    </span>
                    <span className='text-xs text-muted-foreground'>
                        {row.original.email}
                    </span>
                </div>
            )
        }
    },
    {
        accessorKey: 'identity_number',
        header: 'NIK',
        cell: ({ row }) => row.getValue('identity_number') || '-'
    },
    {
        accessorKey: 'employee_number',
        header: 'NIP',
        cell: ({ row }) => row.getValue('employee_number') || '-'
    },
    {
        accessorKey: 'license_number',
        header: 'SIPB (License)',
        cell: ({ row }) => row.getValue('license_number') || '-'
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue<Midwife['status']>('status')
            const statusColors: Record<Midwife['status'], string> = {
                active: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
                inactive:
                    'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
                disabled:
                    'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
                pending_verification:
                    'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20'
            }
            const statusLabels: Record<Midwife['status'], string> = {
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
        cell: () => {
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                            <span className='sr-only'>Open menu</span>
                            <DotsThree className='h-4 w-4' />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className='w-40 font-mono'>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className='cursor-pointer flex items-center gap-2'>
                            <PencilSimple className='h-4 w-4' />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className='cursor-pointer text-red-600 dark:text-red-400 flex items-center gap-2 focus:text-red-600'>
                            <Trash className='h-4 w-4' />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]
