'use client'

import { useQuery } from '@tanstack/react-query'

export default function Home() {
    const { data, isPending, isError } = useQuery({
        queryKey: ['hello'],
        queryFn: async () => {
            // Simulated API call
            await new Promise(resolve => setTimeout(resolve, 1000))
            return 'Data fetched with TanStack Query!'
        }
    })

    if (isPending) return <p>Loading...</p>
    if (isError) return <p>Error fetching data.</p>

    return (
        <div className='space-y-4'>
            <h1 className='text-2xl font-bold'>hello world</h1>
            <p className='text-muted-foreground'>{data}</p>
        </div>
    )
}
