import type * as React from 'react'

interface DashboardTitleProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string
    subtitle?: string
}

export function DashboardTitle({
    title,
    subtitle,
    className,
    ...props
}: Readonly<DashboardTitleProps>) {
    return (
        <div className={`space-y-1.5 ${className ?? ''}`} {...props}>
            <h1 className='text-3xl font-bold tracking-tight text-foreground md:text-2xl'>
                {title}
            </h1>
            {subtitle && (
                <p className='text-sm text-muted-foreground'>{subtitle}</p>
            )}
        </div>
    )
}
