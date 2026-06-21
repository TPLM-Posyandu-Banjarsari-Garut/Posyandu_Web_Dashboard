import { z } from "zod";

export default z.object({ "code": z.string().min(1).max(10), "name": z.string().min(3).max(100), "description": z.string().nullable().optional(), "target_age_months": z.number().int().gte(0).nullable().optional(), "max_doses": z.number().int().gt(0).nullable().optional(), "min_interval_days": z.number().int().gte(0).nullable().optional(), "route": z.union([z.literal("injection"), z.literal("oral"), z.literal(null)]).nullable().optional() });
