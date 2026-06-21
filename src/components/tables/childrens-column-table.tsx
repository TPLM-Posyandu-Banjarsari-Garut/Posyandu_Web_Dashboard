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

export interface Child {
    id: string
    name: string
    identity_number: string
    gender: 'male' | 'female'
    child_category?: 'infant' | 'young_child' | 'toddler' | null
    birth_date?: string | Date
    place_of_birth?: string | null
    birth_weight?: string
    birth_length?: string
    birth_head_circumference?: string
    createdAt?: string
    updatedAt?: string
}

export const columns: ColumnDef<Child>[] = [
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
        header: 'Child Name',
        cell: ({ row }) => {
            return (
                <span className='font-medium text-foreground'>
                    {row.getValue('name')}
                </span>
            )
        }
    },
    {
        accessorKey: 'identity_number',
        header: 'NIK',
        cell: ({ row }) => row.getValue('identity_number') || '-'
    },
    {
        accessorKey: 'gender',
        header: 'Gender',
        cell: ({ row }) => {
            const gender = row.getValue<'male' | 'female'>('gender')
            return (
                <Badge
                    variant='outline'
                    className={
                        gender === 'male'
                            ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                            : 'bg-pink-500/10 text-pink-600 border-pink-500/20'
                    }
                >
                    {gender === 'male' ? 'Boy' : 'Girl'}
                </Badge>
            )
        }
    },
    {
        accessorKey: 'child_category',
        header: 'Category',
        cell: ({ row }) => {
            const category =
                row.getValue<Child['child_category']>('child_category')
            if (!category) return '-'
            const categoryLabels: Record<
                NonNullable<Child['child_category']>,
                string
            > = {
                infant: 'Infant (0-12m)',
                young_child: 'Young Child (1-3y)',
                toddler: 'Toddler (3-5y)'
            }
            return categoryLabels[category] || category
        }
    },
    {
        accessorKey: 'birth_date',
        header: 'Birth Date',
        cell: ({ row }) => {
            const birthDate = row.getValue<string | Date>('birth_date')
            if (!birthDate) return '-'
            const date = new Date(birthDate)
            return date.toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
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
