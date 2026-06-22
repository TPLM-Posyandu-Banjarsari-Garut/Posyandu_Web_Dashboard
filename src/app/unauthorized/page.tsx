'use client'

import { ArrowLeft, Chats, Envelope, Lock } from '@phosphor-icons/react'
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
                <CardHeader className='p-0 flex flex-col items-center gap-4'>
                    <div className='mx-auto flex size-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 shadow-inner'>
                        <Lock
                            size={30}
                            className='animate-bounce'
                            style={{ animationDuration: '3s' }}
                        />
                    </div>

                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100/60 text-red-800 dark:bg-red-900/30 dark:text-red-300 w-fit mx-auto font-mono'>
                        403 Forbidden
                    </span>

                    <div className='flex flex-col gap-2'>
                        <CardTitle className='text-2xl font-bold tracking-tight'>
                            Access Denied
                        </CardTitle>
                        <CardDescription className='text-sm text-muted-foreground leading-relaxed'>
                            Your account does not have administrator privileges
                            to access this dashboard.
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className='p-0 flex flex-col text-left'>
                    <Separator className='mb-4' />
                    <div className='flex flex-col gap-3'>
                        <h3 className='text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1'>
                            Contact Help Center
                        </h3>

                        <div className='flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 hover:bg-muted/50 transition-all duration-300 group'>
                            <div className='flex size-11 items-center justify-center rounded-xl bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 group-hover:scale-105 transition-transform duration-300 shadow-sm'>
                                <Chats size={22} />
                            </div>
                            <div>
                                <p className='text-[11px] font-semibold text-muted-foreground uppercase tracking-wider'>
                                    WhatsApp Support
                                </p>
                                <a
                                    href='https://wa.me/628123456789'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-sm font-bold hover:underline text-foreground'
                                >
                                    +62 812-3456-789
                                </a>
                            </div>
                        </div>

                        <div className='flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 hover:bg-muted/50 transition-all duration-300 group'>
                            <div className='flex size-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform duration-300 shadow-sm'>
                                <Envelope size={22} />
                            </div>
                            <div>
                                <p className='text-[11px] font-semibold text-muted-foreground uppercase tracking-wider'>
                                    Admin Email
                                </p>
                                <a
                                    href='mailto:admin@posyandubanjarsari.my.id'
                                    className='text-sm font-bold hover:underline text-foreground break-all'
                                >
                                    admin@posyandubanjarsari.my.id
                                </a>
                            </div>
                        </div>
                    </div>
                    <Separator className='mt-4' />
                </CardContent>

                <CardFooter className='border-t-0 flex flex-col gap-2 pb-8'>
                    <Button
                        type='button'
                        onClick={handleBackToLogin}
                        disabled={logout.isPending}
                        className='w-full'
                    >
                        {logout.isPending ? (
                            <>
                                <Spinner className='text-white' />
                                Clearing session...
                            </>
                        ) : (
                            <>
                                <ArrowLeft size={16} />
                                Back to Login
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
