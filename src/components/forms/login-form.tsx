'use client'

import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    Field as UIField
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email wajib diisi')
        .email('Format email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter')
})

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    const form = useForm({
        defaultValues: {
            email: '',
            password: ''
        },
        onSubmit: async ({ value }) => {
            // Simulasi proses login
            await new Promise(resolve => setTimeout(resolve, 1500))
            console.log('Login berhasil:', value)
        }
    })

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <form
                onSubmit={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    form.handleSubmit()
                }}
            >
                <FieldGroup>
                    <div className='flex flex-col items-center gap-2 text-center'>
                        <h1 className='text-xl font-bold'>
                            Welcome to Sampurasun Dashboard.
                        </h1>
                        <FieldDescription>
                            Dashboard management for Sampurasun
                        </FieldDescription>
                    </div>

                    <form.Field
                        name='email'
                        validators={{
                            onChange: ({ value }) => {
                                const result =
                                    loginSchema.shape.email.safeParse(value)
                                return result.success
                                    ? undefined
                                    : result.error.issues[0]?.message
                            }
                        }}
                    >
                        {field => (
                            <UIField>
                                <FieldLabel htmlFor={field.name}>
                                    Email
                                </FieldLabel>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    type='email'
                                    placeholder='m@example.com'
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={e =>
                                        field.handleChange(e.target.value)
                                    }
                                />
                                {field.state.meta.errors.length > 0 && (
                                    <FieldError
                                        errors={field.state.meta.errors.map(
                                            msg => ({
                                                message: msg?.toString()
                                            })
                                        )}
                                    />
                                )}
                            </UIField>
                        )}
                    </form.Field>

                    <form.Field
                        name='password'
                        validators={{
                            onChange: ({ value }) => {
                                const result =
                                    loginSchema.shape.password.safeParse(value)
                                return result.success
                                    ? undefined
                                    : result.error.issues[0]?.message
                            }
                        }}
                    >
                        {field => (
                            <UIField>
                                <FieldLabel htmlFor={field.name}>
                                    Password
                                </FieldLabel>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    type='password'
                                    placeholder='••••••••'
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={e =>
                                        field.handleChange(e.target.value)
                                    }
                                />
                                {field.state.meta.errors.length > 0 && (
                                    <FieldError
                                        errors={field.state.meta.errors.map(
                                            msg => ({
                                                message: msg?.toString()
                                            })
                                        )}
                                    />
                                )}
                            </UIField>
                        )}
                    </form.Field>

                    <UIField>
                        <form.Subscribe
                            selector={state => [
                                state.canSubmit,
                                state.isSubmitting
                            ]}
                        >
                            {([canSubmit, isSubmitting]) => (
                                <Button type='submit' disabled={!canSubmit}>
                                    {isSubmitting ? 'Memproses...' : 'Login'}
                                </Button>
                            )}
                        </form.Subscribe>
                    </UIField>
                </FieldGroup>
            </form>
        </div>
    )
}
