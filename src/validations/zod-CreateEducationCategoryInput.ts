import { z } from "zod";

export default z.object({ "name": z.string().min(3).max(100), "slug": z.string().regex(new RegExp("^[a-z0-9]+(?:-[a-z0-9]+)*$")).min(3).max(120), "description": z.string().nullable().optional(), "status": z.enum(["active","inactive"]).default("active") });
