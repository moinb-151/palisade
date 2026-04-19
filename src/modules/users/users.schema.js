import * as z from "zod";

export const LoginRequestSchema = z.object({
    username: z.string({"error": "username is required"}).min(3).max(255),
    password: z.string({"error": "password is required"}).min(6).max(255),
})

export const CreateRoleRequestSchema = z.object({
    roleName: z.string({"error": "roleName is required"}).min(3).max(255),
    permissions: z.array(z.string({"error": "permissions must be an array of strings"})).min(1, {"error": "at least one permission is required"}),
})

export const PaginationQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
})