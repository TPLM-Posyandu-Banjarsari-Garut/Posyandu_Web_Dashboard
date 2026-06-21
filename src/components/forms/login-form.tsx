'use client'

import { Button } from '@/components/ui/button'
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <form>
                <FieldGroup>
                    <div className='flex flex-col items-center gap-2 text-center'>
                        <h1 className='text-xl font-bold'>
                            Welcome to Sampurasun Dashboard.
                        </h1>
                        <FieldDescription>
                            Dashboard management for Sampurasun
                        </FieldDescription>
                    </div>
                    <Field>
                        <FieldLabel htmlFor='email'>Email</FieldLabel>
                        <Input
                            id='email'
                            type='email'
                            placeholder='m@example.com'
                            required
                        />
                    </Field>
                    <Field>
                        <Button type='submit'>Login</Button>
                    </Field>
                </FieldGroup>
            </form>
        </div>
    )
}
