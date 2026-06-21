import { z } from 'zod'

export default z.object({
    posyandu_id: z.string().min(1),
    name: z.string().min(1).max(100),
    identity_number: z.string().min(16).max(16),
    gender: z.enum(['male', 'female']),
    child_category: z
        .union([
            z.literal('infant'),
            z.literal('young_child'),
            z.literal('toddler'),
            z.literal(null)
        ])
        .nullable()
        .optional(),
    place_of_birth: z.string().max(100).nullable().optional(),
    birth_date: z.date().optional(),
    birth_order: z.number().int().gt(0).nullable().optional(),
    blood_type: z
        .union([
            z.literal('A'),
            z.literal('B'),
            z.literal('AB'),
            z.literal('O'),
            z.literal('UNKNOWN'),
            z.literal(null)
        ])
        .nullable()
        .optional(),
    birth_weight: z.string().optional(),
    birth_length: z.string().optional(),
    birth_head_circumference: z.string().optional()
})
