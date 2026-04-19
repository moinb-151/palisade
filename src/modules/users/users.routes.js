import { LoginRequestSchema, CreateRoleRequestSchema } from "./users.schema.js";
import { 
    loginHandler, 
    createRoleHandler,
    createPermissionHandler 
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

    fastify.post("/permissions/", {
        preHandler: [fastify.authenticate, fastify.requiredPermission("create:permissions")],
    }, createPermissionHandler);
}