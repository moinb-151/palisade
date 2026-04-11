import { LoginRequestSchema } from "./users.schema.js";
import { loginHandler } from "./users.controller.js";

export default async function userRoutes(fastify) {
    fastify.post("/login/", {
        schema: {
            body: LoginRequestSchema,
        }
    }, loginHandler);
}