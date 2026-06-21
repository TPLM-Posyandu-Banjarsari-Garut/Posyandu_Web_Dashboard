import { z } from 'zod'

export default z.object({
    name: z.string().min(3).max(100).optional(),
    email: z.string().email().max(255).optional(),
    email_verified: z.boolean().optional(),
    phone_number: z.string().max(20).nullable().optional(),
    avatar_url: z
        .string()
        .url()
        .nullable()
        .describe('User avatar URL (uploaded via /api/medias/upload first)')
        .optional(),
    role: z
        .enum(['posyandu_admin', 'village_admin', 'parent', 'cadre', 'midwife'])
        .optional(),
    status: z
        .enum(['active', 'inactive', 'disabled', 'pending_verification'])
        .default('active'),
    password: z.string().min(8).max(100).optional()
})
