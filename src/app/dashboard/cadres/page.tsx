'use client'

import { useState } from 'react'
import {
    type Cadre,
    columns
} from '@/components/columns-table/cadres-column-table'
import { DashboardTitle } from '@/components/dashboard/dashboard-title'
import { DataTable } from '@/components/tables/data-table'

const mockCadres: Cadre[] = [
    {
        id: '1',
        name: 'Siti Aminah',
        email: 'siti.aminah@village.mail',
        identity_number: '3205010203040001',
        position: 'leader',
        is_primary_assignment: true,
        status: 'active'
    },
    {
        id: '2',
        name: 'Rahmawati',
        email: 'rahma.wati@village.mail',
        identity_number: '3205010203040002',
        position: 'secretary',
        is_primary_assignment: true,
        status: 'active'
    },
    {
        id: '3',
        name: 'Sri Wahyuni',
        email: 'sri.wahyuni@village.mail',
        identity_number: '3205010203040003',
        position: 'treasurer',
        is_primary_assignment: false,
        status: 'active'
    },
    {
        id: '4',
        name: 'Fitriani',
        email: 'fitri.ani@village.mail',
        identity_number: null,
        position: 'member',
        is_primary_assignment: true,
        status: 'inactive'
    }
]

export default function CadresPage() {
    const [isLoading, setIsLoading] = useState(false)

    const handleRefresh = () => {
        setIsLoading(true)
        setTimeout(() => {
            setIsLoading(false)
        }, 1500)
    }

    const handleDelete = (selectedItems: Cadre[]) => {
        const names = selectedItems.map(c => c.name).join(', ')
        alert(`Moving to Trash: ${names}`)
    }

    return (
        <>
            <DashboardTitle
                title='Cadres'
                subtitle='Manage Posyandu cadres data'
            />

            <section className='mt-6'>
                <DataTable
                    columns={columns}
                    data={mockCadres}
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
