import { z } from "zod";

export default z.object({ "email": z.string().email(), "otp": z.string() });
