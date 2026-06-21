'use client'

import { useState } from 'react'
import { DashboardTitle } from '@/components/dashboard/dashboard-title'
import { DataTable } from '@/components/tables/data-table'
import { columns, type Parent } from '@/components/tables/parents-column-table'

const mockParents: Parent[] = [
    {
        id: '1',
        name: 'Joko Widodo',
        email: 'jokowi@mail.com',
        identity_number: '3205010203040021',
        education: 'Bachelor',
        occupation: 'Civil Servant',
        address_line: 'Jl. Istana Negara No. 1',
        rt: '01',
        rw: '01',
        village_name: 'Banjarsari',
        status: 'active'
    },
    {
        id: '2',
        name: 'Iriana',
        email: 'iriana@mail.com',
        identity_number: '3205010203040022',
        education: 'High School',
        occupation: 'Housewife',
        address_line: 'Jl. Istana Negara No. 1',
        rt: '01',
        rw: '01',
        village_name: 'Banjarsari',
        status: 'active'
    }
]

export default function ParentsPage() {
    const [isLoading, setIsLoading] = useState(false)

    const handleRefresh = () => {
        setIsLoading(true)
        setTimeout(() => {
            setIsLoading(false)
        }, 1500)
    }

    const handleDelete = (selectedItems: Parent[]) => {
        const names = selectedItems.map(p => p.name).join(', ')
        alert(`Moving to Trash: ${names}`)
    }

    return (
        <>
            <DashboardTitle
                title='Parents'
                subtitle='Manage Posyandu parents data'
            />

            <section className='mt-6'>
                <DataTable
                    columns={columns}
                    data={mockParents}
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
