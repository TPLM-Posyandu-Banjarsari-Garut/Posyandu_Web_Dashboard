'use client'

import {
    ArrowLeftIcon,
    ChatsIcon,
    EnvelopeIcon,
    PhoneCallIcon
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { useLogout } from '@/hooks/use-auth'

export default function UnauthorizedPage() {
    const logout = useLogout()

    const handleBackToLogin = async () => {
        try {
            await logout.mutateAsync()
        } catch (err) {
            console.error('Logout cleanup failed:', err)
            globalThis.location.href = '/'
        }
    }

    return (
        <div className='relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10'>
            <div className='pointer-events-none absolute inset-0 -z-10 size-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] bg-size-[16px_16px] opacity-60'></div>

            <Card className='w-full max-w-md rounded-2xl bg-card p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border ring-0 flex flex-col gap-6 text-center text-sm [--card-spacing:0px]'>
                <CardHeader className='p-0 flex flex-col items-center gap-6'>
                    <div className='mx-auto flex size-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 shadow-inner'>
                        <PhoneCallIcon size={32} className='animate-pulse' />
                    </div>

                    <div className='flex flex-col gap-2'>
                        <CardTitle className='text-2xl font-bold tracking-tight'>
                            Access Denied
                        </CardTitle>
                        <CardDescription className='text-sm text-muted-foreground'>
                            Your account does not have administrator privileges
                            to access this dashboard.
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className='p-0 flex flex-col text-left'>
                    <Separator />
                    <div className='py-4 flex flex-col gap-3'>
                        <h3 className='text-sm font-semibold text-foreground'>
                            Contact Help Center:
                        </h3>

                        <div className='flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors border border-transparent hover:border-border'>
                            <div className='flex size-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400'>
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
                            <div className='flex size-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'>
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
                    <Separator />
                </CardContent>

                <CardFooter className='p-0 border-t-0 flex flex-col gap-2'>
                    <Button
                        type='button'
                        onClick={handleBackToLogin}
                        disabled={logout.isPending}
                        className='w-full rounded-xl py-2.5 text-sm h-auto cursor-pointer shadow transition-colors font-medium hover:bg-primary/95 focus-visible:outline-none disabled:opacity-50'
                    >
                        {logout.isPending ? (
                            <>
                                <Spinner data-icon='inline-start' />
                                Clearing session...
                            </>
                        ) : (
                            <>
                                <ArrowLeftIcon data-icon='inline-start' />
                                Back to Login
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
