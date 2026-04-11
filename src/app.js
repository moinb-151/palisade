import fastify from "fastify";

export async function buildApp() {
    const app = fastify({
        logger: true,
    });

    return app;
}