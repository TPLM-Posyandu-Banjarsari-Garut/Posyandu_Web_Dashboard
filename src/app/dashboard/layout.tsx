import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { Header } from '@/components/dashboard/header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { checkSession } from '@/lib/session'

export default async function DashboardLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    // Secure the dashboard with server-side authentication and authorization
    await checkSession()

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <Header />
                <main className='flex-1 w-full px-6 py-6 min-w-0 overflow-hidden'>
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
