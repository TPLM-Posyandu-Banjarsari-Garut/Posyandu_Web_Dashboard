import { LoginForm } from '@/components/forms/login-form'

export default function LoginPage() {
    return (
        <div className='relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10'>
            <div className='pointer-events-none absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] bg-size-[16px_16px] opacity-60'></div>

            <div className='w-full max-w-md rounded-2xl bg-card p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border'>
                <LoginForm />
            </div>
        </div>
    )
}
