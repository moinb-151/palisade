import { 
    LoginRequestSchema, 
    CreateRoleRequestSchema,
    PaginationQuerySchema,
    UserIdParamSchema,
    AssignRoleRequestSchema
} from "./users.schema.js";
import { 
    loginHandler, 
    createRoleHandler,
    getRolesHandler,
    createPermissionHandler, 
    getPermissionsHandler,
    updateUserRoleHandler
} from "./users.controller.js";

export default async function userRoutes(fastify) {
    fastify.post("/login/", {
        schema: {
            body: LoginRequestSchema,
        }
    }, loginHandler);

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

    fastify.patch("/users/change-role/:userId/", {
        schema: {
            params: UserIdParamSchema,
            body: AssignRoleRequestSchema,
        },
        preHandler: [fastify.authenticate, fastify.requirePermission("update:user-roles")],
    }, updateUserRoleHandler);
}