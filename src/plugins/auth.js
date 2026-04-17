import fp from "fastify-plugin";
import { verifyToken } from "../utils/jwt.js";

async function authPlugin (fastify) {
    fastify.decorate("authenticate", async (request, reply) => {
        const token = request.cookies["access_token"];

        if (!token) {
            return reply.status(401).send({ message: "Unauthorized" });
        }

        try {
            const decoded = await verifyToken(fastify, token);
            request.user = decoded;
        } catch (err) {
            return reply.status(401).send({ message: "Unauthorized" });
        }
    });
}

export default fp(authPlugin);