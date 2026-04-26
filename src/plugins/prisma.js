import fp from "fastify-plugin";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
    log: ["error", "warn"],
});

async function prismaPlugin (fastify) {

    try {
        await prisma.$connect();
    } catch (err) {
        fastify.log.error("Failed to connect to the database:", err);
        throw err;
    }
    
    fastify.decorate("prisma", prisma);

    fastify.addHook("onClose", async (instance) => {
        await instance.prisma.$disconnect();
    });
}

export default fp(prismaPlugin);