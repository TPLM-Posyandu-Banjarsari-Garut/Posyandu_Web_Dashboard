'use client'

import { useState } from 'react'
import { DashboardTitle } from '@/components/dashboard/dashboard-title'
import { DataTable } from '@/components/tables/data-table'
import { columns, type User } from '@/components/tables/users-column-table'

const mockUsers: User[] = [
    {
        id: '1',
        name: 'Siti Aminah',
        email: 'siti.aminah@village.mail',
        phone_number: '081234567890',
        avatar_url: null,
        role: 'cadre',
        status: 'active'
    },
    {
        id: '2',
        name: 'Dr. Budi Santoso',
        email: 'budi.santoso@health.mail',
        phone_number: '089876543210',
        avatar_url: null,
        role: 'midwife',
        status: 'active'
    },
    {
        id: '3',
        name: 'Dewi Lestari',
        email: 'dewi.lestari@parent.mail',
        phone_number: '085612345678',
        avatar_url: null,
        role: 'parent',
        status: 'active'
    },
    {
        id: '4',
        name: 'Admin Utama',
        email: 'admin@posyandu.mail',
        phone_number: null,
        avatar_url: null,
        role: 'posyandu_admin',
        status: 'active'
    },
    {
        id: '5',
        name: 'Ahmad Yusuf',
        email: 'ahmad.yusuf@village.mail',
        phone_number: '082233445566',
        avatar_url: null,
        role: 'village_admin',
        status: 'inactive'
    }
]

export default function UsersPage() {
    const [isLoading, setIsLoading] = useState(false)

    const handleRefresh = () => {
        setIsLoading(true)
        setTimeout(() => {
            setIsLoading(false)
        }, 1500)
    }

    const handleDelete = (selectedUsers: User[]) => {
        const names = selectedUsers.map(u => u.name).join(', ')
        alert(`Moving to Trash: ${names}`)
    }

    return (
        <>
            <DashboardTitle
                title='Users'
                subtitle='Manage Posyandu system users data'
            />

            <section className='mt-6'>
                <DataTable
                    columns={columns}
                    data={mockUsers}
                    isLoading={isLoading}
                    onRefresh={handleRefresh}
                    onDelete={handleDelete}
                    config={{
                        enableSorting: true,
                        enableFiltering: true,
                        enableColumnVisibility: true
                    }}
                />
            </section>
        </>
    )
}
