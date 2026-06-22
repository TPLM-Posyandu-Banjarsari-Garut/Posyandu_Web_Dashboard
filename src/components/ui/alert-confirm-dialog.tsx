'use client'

import {
    CheckCircle,
    Info,
    Question,
    WarningOctagon
} from '@phosphor-icons/react'
import type * as React from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

export interface AlertConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    variant?: 'success' | 'confirm' | 'info' | 'destructive'
    actionLabel?: string
    cancelLabel?: string
    onAction: () => void | Promise<void>
    isLoading?: boolean
}

const variantConfig = {
    success: {
        icon: CheckCircle,
        iconClass: 'text-green-500 bg-green-500/10',
        actionClass:
            'bg-green-600 hover:bg-green-700 text-white focus:ring-green-600'
    },
    confirm: {
        icon: Question,
        iconClass: 'text-blue-500 bg-blue-500/10',
        actionClass:
            'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-600'
    },
    info: {
        icon: Info,
        iconClass: 'text-sky-500 bg-sky-500/10',
        actionClass: 'bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-600'
    },
    destructive: {
        icon: WarningOctagon,
        iconClass: 'text-red-500 bg-red-500/10',
        actionClass: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-600'
    }
}

export function AlertConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    variant = 'confirm',
    actionLabel = 'Continue',
    cancelLabel = 'Cancel',
    onAction,
    isLoading = false
}: Readonly<AlertConfirmDialogProps>) {
    const config = variantConfig[variant]
    const IconComponent = config.icon

    const handleAction = async (e: React.MouseEvent) => {
        e.preventDefault()
        await onAction()
        onOpenChange(false)
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent size='default'>
                <div className='flex gap-4 items-start p-2'>
                    <div
                        className={cn(
                            'p-2.5 rounded-none shrink-0',
                            config.iconClass
                        )}
                    >
                        <IconComponent className='h-5 w-5' />
                    </div>
                    <div className='space-y-1.5 flex-1'>
                        <AlertDialogHeader className='text-left place-items-start sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left'>
                            <AlertDialogTitle className='text-base font-semibold text-foreground'>
                                {title}
                            </AlertDialogTitle>
                            <AlertDialogDescription className='text-sm text-muted-foreground'>
                                {description}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                    </div>
                </div>
                <AlertDialogFooter className='mt-2 flex items-center justify-end gap-2'>
                    <AlertDialogCancel
                        className='font-mono rounded-none h-9 mt-0'
                        disabled={isLoading}
                    >
                        {cancelLabel}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleAction}
                        disabled={isLoading}
                        className={cn(
                            'font-mono rounded-none h-9',
                            config.actionClass
                        )}
                    >
                        {isLoading ? 'Processing...' : actionLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
