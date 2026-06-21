'use client'

import { useState } from 'react'
import { DashboardTitle } from '@/components/dashboard/dashboard-title'
import { DataTable } from '@/components/tables/data-table'
import {
    columns,
    type Midwife
} from '@/components/tables/midwifes-column-table'

const mockMidwives: Midwife[] = [
    {
        id: '1',
        name: 'Dr. Budi Santoso',
        email: 'budi.santoso@health.mail',
        identity_number: '3205010203040031',
        employee_number: '198801022015031002',
        license_number: '503/446/SIPB/VIII/2022',
        status: 'active'
    },
    {
        id: '2',
        name: 'Siti Aminah, A.Md.Keb.',
        email: 'siti.midwife@health.mail',
        identity_number: '3205010203040032',
        employee_number: '199205122018042001',
        license_number: '503/124/SIPB/IV/2023',
        status: 'active'
    }
]

export default function MidwifesPage() {
    const [isLoading, setIsLoading] = useState(false)

    const handleRefresh = () => {
        setIsLoading(true)
        setTimeout(() => {
            setIsLoading(false)
        }, 1500)
    }

    const handleDelete = (selectedItems: Midwife[]) => {
        const names = selectedItems.map(m => m.name).join(', ')
        alert(`Moving to Trash: ${names}`)
    }

    return (
        <>
            <DashboardTitle
                title='Midwives'
                subtitle='Manage Posyandu midwives data'
            />

            <section className='mt-6'>
                <DataTable
                    columns={columns}
                    data={mockMidwives}
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
