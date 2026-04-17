import fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import { validatorCompiler, serializerCompiler } from "fastify-type-provider-zod";
import prismaPlugin from "./plugins/prisma.js";
import authPlugin from "./plugins/auth.js";
import userRoutes from "./modules/users/users.routes.js";
import { JWT_SECRET, JWT_ALGORITHM } from "./config/env.js";

export async function buildApp() {
    const app = fastify({
        logger: true,
    });

    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

    await app.register(fastifyJwt, {
        secret: JWT_SECRET,
        sign: {
            algorithm: JWT_ALGORITHM,
        },
        verify: {
            algorithms: [JWT_ALGORITHM],
        },
    });

    await app.register(fastifyCookie);

    await app.register(prismaPlugin);
    await app.register(authPlugin);
    
    await app.register(userRoutes, { prefix: "/users" });

    return app;
}