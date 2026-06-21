'use client'

import {
    ArrowLeftIcon,
    ChatsIcon,
    EnvelopeIcon,
    PhoneCallIcon
} from '@phosphor-icons/react'
import { useLogout } from '@/hooks/user-auth'

export default function UnauthorizedPage() {
    const logout = useLogout()

    const handleBackToLogin = async () => {
        try {
            await logout.mutateAsync()
        } catch (err) {
            console.error('Logout cleanup failed:', err)
            globalThis.location.href = '/login'
        }
    }

    return (
        <div className='relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10'>
            <div className='pointer-events-none absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] bg-size-[16px_16px] opacity-60'></div>

            <div className='w-full max-w-md rounded-2xl bg-card p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border flex flex-col gap-6 text-center'>
                <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 shadow-inner'>
                    <PhoneCallIcon size={32} className='animate-pulse' />
                </div>

                <div className='flex flex-col gap-2'>
                    <h1 className='text-2xl font-bold tracking-tight'>
                        Access Denied
                    </h1>
                    <p className='text-sm text-muted-foreground'>
                        Your account does not have administrator privileges to
                        access this dashboard.
                    </p>
                </div>

                <div className='border-t border-b py-4 flex flex-col gap-3 text-left'>
                    <h3 className='text-sm font-semibold text-foreground'>
                        Contact Help Center:
                    </h3>

                    <div className='flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors border border-transparent hover:border-border'>
                        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400'>
                            <ChatsIcon size={20} />
                        </div>
                        <div>
                            <p className='text-xs text-muted-foreground'>
                                WhatsApp Support
                            </p>
                            <a
                                href='https://wa.me/628123456789'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-sm font-medium hover:underline text-foreground'
                            >
                                +62 812-3456-789
                            </a>
                        </div>
                    </div>

                    <div className='flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors border border-transparent hover:border-border'>
                        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'>
                            <EnvelopeIcon size={20} />
                        </div>
                        <div>
                            <p className='text-xs text-muted-foreground'>
                                Admin Email
                            </p>
                            <a
                                href='mailto:admin@posyandubanjarsari.my.id'
                                className='text-sm font-medium hover:underline text-foreground'
                            >
                                admin@posyandubanjarsari.my.id
                            </a>
                        </div>
                    </div>
                </div>

                <div className='flex flex-col gap-2'>
                    <button
                        type='button'
                        onClick={handleBackToLogin}
                        disabled={logout.isPending}
                        className='inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium shadow transition-colors hover:bg-primary/95 focus-visible:outline-none disabled:opacity-50 cursor-pointer'
                    >
                        <ArrowLeftIcon size={16} />
                        {logout.isPending
                            ? 'Clearing session...'
                            : 'Back to Login'}
                    </button>
                </div>
            </div>
        </div>
    )
}
