'use client'

import { useForm } from '@tanstack/react-form'
import { useEffect } from 'react'
import { toast } from 'sonner'
import type { z } from 'zod'
import type { User } from '@/components/columns-table/users-column-table'
import { Button } from '@/components/ui/button'
import {
    FieldError,
    FieldGroup,
    FieldLabel,
    Field as UIField
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle
} from '@/components/ui/sheet'
import { useCreateUser, useUpdateUser } from '@/hooks/use-users'
import zodCreateUserInput from '@/validations/zod-CreateUserInput'
import zodUpdateUserInput from '@/validations/zod-UpdateUserInput'

interface CrudUserSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user?: User | null
}

const roleOptions = [
    { label: 'Posyandu Admin', value: 'posyandu_admin' },
    { label: 'Village Admin', value: 'village_admin' },
    { label: 'Midwife', value: 'midwife' },
    { label: 'Cadre', value: 'cadre' },
    { label: 'Parent', value: 'parent' }
] as const

const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Disabled', value: 'disabled' },
    { label: 'Pending Verification', value: 'pending_verification' }
] as const

export function UsersSheet({
    open,
    onOpenChange,
    user
}: Readonly<CrudUserSheetProps>) {
    const isEditMode = !!user
    const createUser = useCreateUser()
    const updateUser = useUpdateUser()

    const form = useForm({
        defaultValues: {
            name: '',
            email: '',
            phone_number: '',
            role: 'cadre' as User['role'],
            status: 'active' as User['status'],
            password: ''
        },
        onSubmit: async ({ value }) => {
            try {
                if (isEditMode && user) {
                    const payload: z.infer<typeof zodUpdateUserInput> = {
                        name: value.name,
                        email: value.email,
                        role: value.role,
                        status: value.status,
                        phone_number: value.phone_number || null
                    }
                    if (value.password) {
                        payload.password = value.password
                    }

                    await updateUser.mutateAsync({
                        publicId: user.id,
                        payload
                    })
                    toast.success('User updated successfully')
                } else {
                    await createUser.mutateAsync({
                        name: value.name,
                        email: value.email,
                        role: value.role,
                        status: value.status,
                        password: value.password,
                        phone_number: value.phone_number || null
                    })
                    toast.success('User created successfully')
                }
                onOpenChange(false)
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : 'An error occurred during submission'
                toast.error(message)
            }
        }
    })

    // Reset default values when user changes or modal opens
    useEffect(() => {
        if (open) {
            form.reset({
                name: user?.name ?? '',
                email: user?.email ?? '',
                phone_number: user?.phone_number ?? '',
                role: user?.role ?? 'cadre',
                status: user?.status ?? 'active',
                password: ''
            })
        }
    }, [
        open,
        user?.name,
        user?.email,
        user?.phone_number,
        user?.role,
        user?.status,
        form
    ])

    const schema = isEditMode ? zodUpdateUserInput : zodCreateUserInput

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className='w-full sm:max-w-md overflow-y-auto'>
                <SheetHeader>
                    <SheetTitle>
                        {isEditMode ? 'Edit User' : 'Create User'}
                    </SheetTitle>
                    <SheetDescription>
                        {isEditMode
                            ? 'Update user account information and settings'
                            : 'Add a new user account to the Posyandu system'}
                    </SheetDescription>
                </SheetHeader>

                <form
                    onSubmit={e => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}
                    className='p-4 space-y-4'
                >
                    <FieldGroup>
                        {/* Name Field */}
                        <form.Field
                            name='name'
                            validators={{
                                onChange: ({ value }) => {
                                    const result =
                                        schema.shape.name.safeParse(value)
                                    return result.success
                                        ? undefined
                                        : result.error.issues[0]?.message
                                }
                            }}
                        >
                            {field => (
                                <UIField>
                                    <FieldLabel htmlFor={field.name}>
                                        Name
                                    </FieldLabel>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        placeholder='Full Name'
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

                        {/* Email Field */}
                        <form.Field
                            name='email'
                            validators={{
                                onChange: ({ value }) => {
                                    const result =
                                        schema.shape.email.safeParse(value)
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
                                        placeholder='name@example.com'
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

                        {/* Phone Number Field */}
                        <form.Field
                            name='phone_number'
                            validators={{
                                onChange: ({ value }) => {
                                    const result =
                                        schema.shape.phone_number.safeParse(
                                            value || null
                                        )
                                    return result.success
                                        ? undefined
                                        : result.error.issues[0]?.message
                                }
                            }}
                        >
                            {field => (
                                <UIField>
                                    <FieldLabel htmlFor={field.name}>
                                        Phone Number (Optional)
                                    </FieldLabel>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        placeholder='08123456789'
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

                        {/* Role Selector */}
                        <form.Field name='role'>
                            {field => (
                                <UIField>
                                    <FieldLabel htmlFor={field.name}>
                                        Role
                                    </FieldLabel>
                                    <Select
                                        value={field.state.value}
                                        onValueChange={val =>
                                            field.handleChange(
                                                val as User['role']
                                            )
                                        }
                                    >
                                        <SelectTrigger className='w-full rounded-none h-9'>
                                            <SelectValue placeholder='Select user role' />
                                        </SelectTrigger>
                                        <SelectContent className='rounded-none font-mono'>
                                            {roleOptions.map(opt => (
                                                <SelectItem
                                                    key={opt.value}
                                                    value={opt.value}
                                                >
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </UIField>
                            )}
                        </form.Field>

                        {/* Status Selector */}
                        <form.Field name='status'>
                            {field => (
                                <UIField>
                                    <FieldLabel htmlFor={field.name}>
                                        Status
                                    </FieldLabel>
                                    <Select
                                        value={field.state.value}
                                        onValueChange={val =>
                                            field.handleChange(
                                                val as User['status']
                                            )
                                        }
                                    >
                                        <SelectTrigger className='w-full rounded-none h-9'>
                                            <SelectValue placeholder='Select status' />
                                        </SelectTrigger>
                                        <SelectContent className='rounded-none font-mono'>
                                            {statusOptions.map(opt => (
                                                <SelectItem
                                                    key={opt.value}
                                                    value={opt.value}
                                                >
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </UIField>
                            )}
                        </form.Field>

                        {/* Password Field */}
                        <form.Field
                            name='password'
                            validators={{
                                onChange: ({ value }) => {
                                    if (isEditMode && !value) return undefined
                                    const result =
                                        schema.shape.password.safeParse(value)
                                    return result.success
                                        ? undefined
                                        : result.error.issues[0]?.message
                                }
                            }}
                        >
                            {field => (
                                <UIField>
                                    <FieldLabel htmlFor={field.name}>
                                        Password{' '}
                                        {isEditMode &&
                                            '(Leave empty to keep current)'}
                                    </FieldLabel>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        type='password'
                                        placeholder={
                                            isEditMode
                                                ? '••••••••'
                                                : 'Password (min. 8 characters)'
                                        }
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
                    </FieldGroup>

                    {/* Action buttons */}
                    <div className='flex items-center justify-end gap-2 pt-4 border-t border-border'>
                        <Button
                            type='button'
                            variant='outline'
                            className='rounded-none h-9 font-mono'
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <form.Subscribe
                            selector={state => [
                                state.canSubmit,
                                state.isSubmitting
                            ]}
                        >
                            {([canSubmit, isSubmitting]) => (
                                <Button
                                    type='submit'
                                    className='rounded-none h-9 font-mono'
                                    disabled={
                                        !canSubmit ||
                                        isSubmitting ||
                                        createUser.isPending ||
                                        updateUser.isPending
                                    }
                                >
                                    {isSubmitting ||
                                    createUser.isPending ||
                                    updateUser.isPending
                                        ? 'Saving...'
                                        : 'Save User'}
                                </Button>
                            )}
                        </form.Subscribe>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    )
}
