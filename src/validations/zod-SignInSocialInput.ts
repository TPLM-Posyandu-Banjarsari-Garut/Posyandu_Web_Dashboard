import { z } from "zod";

export default z.object({ "provider": z.literal("google"), "callbackURL": z.string().url().default("https://sampurasun-web-client.vercel.app/") });
