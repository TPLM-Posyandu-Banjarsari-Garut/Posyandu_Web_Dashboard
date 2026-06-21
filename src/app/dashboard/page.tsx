import { checkSession } from '@/lib/session'

export default async function DashboardPage() {
    // Session validation
    const { user } = await checkSession()

    return (
        <div className='flex flex-col gap-6 p-4 md:p-8'>
            <div className='flex flex-col gap-2'>
                <h1 className='text-3xl font-bold tracking-tight'>
                    Sampurasun Admin Dashboard
                </h1>
                <p className='text-muted-foreground'>
                    Selamat datang kembali,{' '}
                    <span className='font-semibold text-foreground'>
                        {user.name || user.email}
                    </span>{' '}
                    ({user.role})
                </p>
            </div>

            <div className='grid gap-4 md:grid-cols-3'>
                <div className='rounded-xl border bg-card p-6 shadow-sm'>
                    <h3 className='font-semibold leading-none tracking-tight text-sm text-muted-foreground'>
                        Peran Pengguna
                    </h3>
                    <p className='text-2xl font-bold mt-2 capitalize'>
                        {user.role.replace('_', ' ')}
                    </p>
                </div>
                <div className='rounded-xl border bg-card p-6 shadow-sm'>
                    <h3 className='font-semibold leading-none tracking-tight text-sm text-muted-foreground'>
                        Status Sesi
                    </h3>
                    <p className='text-2xl font-bold mt-2 text-green-600 dark:text-green-400 capitalize'>
                        Aktif
                    </p>
                </div>
                <div className='rounded-xl border bg-card p-6 shadow-sm'>
                    <h3 className='font-semibold leading-none tracking-tight text-sm text-muted-foreground'>
                        Email Terdaftar
                    </h3>
                    <p className='text-md font-medium mt-3 text-ellipsis overflow-hidden'>
                        {user.email}
                    </p>
                </div>
            </div>
        </div>
    )
}
