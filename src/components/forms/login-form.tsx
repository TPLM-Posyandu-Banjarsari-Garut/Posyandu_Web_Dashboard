'use client'

import { useForm } from '@tanstack/react-form'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
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

import loginSchema from '@/validations/zod-SignInInput'

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    const router = useRouter()
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const form = useForm({
        defaultValues: {
            email: '',
            password: ''
        },
        onSubmit: async ({ value }) => {
            setErrorMessage(null)
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(value)
                })

                const data = await response.json()

                if (!response.ok) {
                    const message = data.message || 'Email atau password salah.'
                    setErrorMessage(message)
                    toast.error(message)
                    return
                }

                toast.success('Login berhasil! Mengalihkan...')
                router.push('/dashboard')
                router.refresh()
            } catch (err) {
                console.error('Login submission error:', err)
                setErrorMessage('Gagal menghubungi server. Silakan coba lagi.')
                toast.error('Terjadi kesalahan koneksi.')
            }
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

                    {errorMessage && (
                        <div className='p-3 text-sm text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/30 rounded-lg text-center font-medium border border-red-200 dark:border-red-900/50'>
                            {errorMessage}
                        </div>
                    )}

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
