import * as z from "zod";

export const RegisterRequestSchema = z.object({
    username: z.string({"error": "username is required"}).min(3).max(255),
    password: z.string({"error": "password is required"}).min(6).max(255),
    password_confirmation: z.string()
}).refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
});

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

export const UserIdParamSchema = z.object({
    userId: z.coerce.number().int().positive({"error": "userId must be a positive integer"}),
})

export const AssignRoleRequestSchema = z.object({
    roleName: z.string().min(2, { "error": "Role name is required" }),
});

export const UpdateRolePermissionsRequestSchema = z.object({
    roleName: z.string().min(2, { "error": "Role name is required" }),
    permissionsToAdd: z.array(z.string({ "error": "Permissions must be an array of strings" })),
    permissionsToRemove: z.array(z.string({ "error": "Permissions must be an array of strings" }))
})