import { z } from "zod";

export default z.object({ "email": z.string().email().max(255) });
