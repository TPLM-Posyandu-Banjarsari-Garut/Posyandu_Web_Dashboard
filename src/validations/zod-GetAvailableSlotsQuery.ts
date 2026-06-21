import { z } from "zod";

export default z.object({ "posyandu_id": z.string().min(1), "consultation_type": z.enum(["pregnancy","child_development","general"]), "date": z.string().regex(new RegExp("^\\d{4}-\\d{2}-\\d{2}$")) });
