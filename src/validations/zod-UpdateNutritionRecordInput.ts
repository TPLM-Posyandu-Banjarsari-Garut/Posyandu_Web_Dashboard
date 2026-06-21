import { z } from "zod";

export default z.object({ "children_id": z.string().min(1).optional(), "measurement_date": z.string().date().optional(), "weight_kg": z.string().optional(), "height_cm": z.string().optional(), "head_circumference_cm": z.string().optional(), "age_months": z.number().int().gte(0).nullable().optional(), "nutrition_status": z.enum(["normal","underweight","severely_underweight","stunted","wasted","overweight"]).optional(), "cadre_id": z.string().nullable().optional(), "midwife_id": z.string().nullable().optional(), "notes": z.string().nullable().optional() });
