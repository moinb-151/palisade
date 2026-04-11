import * as z from "zod";

export const LoginRequestSchema = z.object({
    username: z.string({"error": "username is required"}).min(3).max(255),
    password: z.string({"error": "password is required"}).min(6).max(255),
})