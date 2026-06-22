'use client'

import { ArrowCounterClockwise, DotsThree, Trash } from '@phosphor-icons/react'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { useState } from 'react'
import { toast } from 'sonner'
import { AlertConfirmDialog } from '@/components/ui/alert-confirm-dialog'
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
import { useHardDeleteTrashItem, useRestoreTrashItem } from '@/hooks/use-trash'
import type { TrashItem } from '@/types/trash'

function ActionCell({ item }: Readonly<{ item: TrashItem }>) {
    const restoreMutation = useRestoreTrashItem()
    const hardDeleteMutation = useHardDeleteTrashItem()
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    const handleRestore = async () => {
        try {
            await restoreMutation.mutateAsync({
                type: item.type,
                publicId: item.id
            })
            toast.success(`Successfully restored ${item.type} "${item.name}"`)
        } catch (err) {
            const error = err as Error
            toast.error(error.message || 'Failed to restore item')
        }
    }

    const handleHardDelete = async () => {
        try {
            await hardDeleteMutation.mutateAsync({
                type: item.type,
                publicId: item.id
            })
            toast.success(
                `Successfully permanently deleted ${item.type} "${item.name}"`
            )
        } catch (err) {
            const error = err as Error
            toast.error(error.message || 'Failed to permanently delete item')
        }
    }

    const isPending = restoreMutation.isPending || hardDeleteMutation.isPending

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant='ghost'
                        className='h-8 w-8 p-0'
                        disabled={isPending}
                    >
                        <span className='sr-only'>Open menu</span>
                        <DotsThree className='h-4 w-4' />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-48 font-mono'>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={handleRestore}
                        disabled={isPending}
                        className='cursor-pointer flex items-center gap-2'
                    >
                        <ArrowCounterClockwise className='h-4 w-4' />
                        Restore Item
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onSelect={e => {
                            e.preventDefault()
                            setIsDeleteDialogOpen(true)
                        }}
                        disabled={isPending}
                        className='cursor-pointer text-red-600 dark:text-red-400 flex items-center gap-2 focus:text-red-600'
                    >
                        <Trash className='h-4 w-4' />
                        Delete Permanently
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title='Delete Permanently'
                description={`Are you sure you want to permanently delete "${item.name}"? This action is IRREVERSIBLE and cannot be undone.`}
                variant='destructive'
                actionLabel='Delete'
                onAction={handleHardDelete}
                isLoading={hardDeleteMutation.isPending}
            />
        </>
    )
}

export const columns: ColumnDef<TrashItem>[] = [
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
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => {
            const type = row.getValue<TrashItem['type']>('type')

            const typeColors: Record<TrashItem['type'], string> = {
                user: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
                children:
                    'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
                posyandu:
                    'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
                education:
                    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                education_category:
                    'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
                vaccine:
                    'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
                vitamin:
                    'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
                pregnancy_record:
                    'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
                nutrition_record:
                    'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
                vitamin_record:
                    'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                immunization_record:
                    'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
                kipi_detail:
                    'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
                examination_schedule:
                    'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
                examination_record:
                    'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
                examination:
                    'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/20',
                inventory:
                    'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
            }

            const formattedType = type
                .split('_')
                .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ')

            return (
                <Badge
                    variant='outline'
                    className={
                        typeColors[type] || 'bg-slate-500/10 text-slate-600'
                    }
                >
                    {formattedType}
                </Badge>
            )
        }
    },
    {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
            <span className='font-medium text-foreground'>
                {row.getValue('name')}
            </span>
        )
    },
    {
        accessorKey: 'deleted_at',
        header: 'Deleted At',
        cell: ({ row }) => {
            const dateStr = row.getValue<string>('deleted_at')
            return format(new Date(dateStr), 'dd MMM yyyy HH:mm')
        }
    },
    {
        id: 'actions',
        cell: ({ row }) => <ActionCell item={row.original} />
    }
]
