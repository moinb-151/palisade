import {
    RegisterRequestSchema,
    LoginRequestSchema, 
    CreateRoleRequestSchema,
    PaginationQuerySchema,
    UserIdParamSchema,
    AssignRoleRequestSchema,
    UpdateRolePermissionsRequestSchema
} from "./users.schema.js";
import {
    registerHandler,
    loginHandler,
    refreshTokenHandler,
    logoutHandler,
    createRoleHandler,
    getRolesHandler,
    createPermissionHandler, 
    getPermissionsHandler,
    updateUserRoleHandler,
    updateRolePermissionsHandler
} from "./users.controller.js";

export default async function userRoutes(fastify) {
    fastify.post("/register/", {
        schema: {
            body: RegisterRequestSchema,
        }
    }, registerHandler);

    fastify.post("/login/", {
        schema: {
            body: LoginRequestSchema,
        }
    }, loginHandler);

    fastify.post("/refresh/", refreshTokenHandler);

    fastify.post("/logout/", { preHandler: [fastify.authenticate] }, logoutHandler)

    fastify.post("/roles/", {
        schema: {
            body: CreateRoleRequestSchema,
        },
        preHandler: [fastify.authenticate, fastify.requirePermission("create:roles")],
    }, createRoleHandler);

    fastify.get("/roles/", {
        schema: {
            querystring: PaginationQuerySchema,
        },
        preHandler: [fastify.authenticate, fastify.requirePermission("create:roles")],
    }, getRolesHandler);

    fastify.post("/permissions/", {
        preHandler: [fastify.authenticate, fastify.requirePermission("create:permissions")],
    }, createPermissionHandler);

    fastify.get("/permissions/", {
        preHandler: [fastify.authenticate, fastify.requirePermission("create:permissions")],
    }, getPermissionsHandler);

    fastify.patch("/update-role-permissions/", {
        schema: {
            body: UpdateRolePermissionsRequestSchema,
        },
        preHandler: [fastify.authenticate, fastify.requirePermission("update:roles")],
    }, updateRolePermissionsHandler);

    fastify.patch("/change-role/:userId/", {
        schema: {
            params: UserIdParamSchema,
            body: AssignRoleRequestSchema,
        },
        preHandler: [fastify.authenticate, fastify.requirePermission("assign:roles")],
    }, updateUserRoleHandler);
}