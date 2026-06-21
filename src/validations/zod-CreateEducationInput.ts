import { z } from 'zod'

export default z.object({
    title: z.string().min(5).max(200),
    content: z.string().min(10),
    summary: z.string().max(500).nullable().optional(),
    image_url: z
        .url()
        .nullable()
        .describe(
            'Education cover image URL (uploaded via /api/medias/upload first)'
        )
        .optional(),
    category_id: z.string().min(1),
    views_count: z.number().int().gte(0).default(0),
    read_time: z.number().int().gte(1).default(1),
    posyandu_id: z.string().nullable().optional(),
    created_by_user_id: z.string().min(1),
    status: z.enum(['active', 'inactive']).default('active')
})
