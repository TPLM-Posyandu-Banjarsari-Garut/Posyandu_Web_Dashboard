import { z } from "zod";

export default z.object({ "posyandu_id": z.string().min(1), "name": z.string().min(1), "description": z.string().nullable().optional(), "examination_type": z.enum(["infant","pregnant_mother","toddler","young_child"]), "target_age_months": z.number().int().nullable().optional(), "target_trimester": z.string().nullable().optional(), "checklist_items": z.any().nullable().optional(), "is_active": z.boolean().default(true) });
