import { 
    LoginRequestSchema, 
    CreateRoleRequestSchema,
    PaginationQuerySchema
} from "./users.schema.js";
import { 
    loginHandler, 
    createRoleHandler,
    getRolesHandler,
    createPermissionHandler, 
    getPermissionsHandler
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
        preHandler: [fastify.authenticate, fastify.requiredPermission("create:roles")],
    }, createRoleHandler);

    fastify.get("/roles/", {
        schema: {
            querystring: PaginationQuerySchema,
        },
        preHandler: [fastify.authenticate, fastify.requiredPermission("create:roles")],
    }, getRolesHandler);

    fastify.post("/permissions/", {
        preHandler: [fastify.authenticate, fastify.requiredPermission("create:permissions")],
    }, createPermissionHandler);

    fastify.get("/permissions/", {
        preHandler: [fastify.authenticate, fastify.requiredPermission("create:permissions")],
    }, getPermissionsHandler);
}