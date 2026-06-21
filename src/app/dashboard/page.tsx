import { DashboardTitle } from '@/components/dashboard/dashboard-title'
import { checkSession } from '@/lib/session'

export default async function DashboardPage() {
    const { user } = await checkSession()

    return (
        <>
            <DashboardTitle
                title='Sampurasun Admin Dashboard'
                subtitle={`Welcome back, ${user.name || user.email} (${user.role})`}
            />
            <section></section>
        </>
    )
}
