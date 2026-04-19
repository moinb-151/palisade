import fp from "fastify-plugin";

export function permissionPlugin(fastify) {
    async function hasPermission(permssion, role) {
        const prisma = fastify.prisma;
        const userRole = await prisma.role.findUnique({
            where: { name: role },
        });

        if (!userRole) return false;

        const isPermission = await prisma.permission.findFirst({
            where: { 
                action: permssion,
                roles : { some: { id: userRole.id } },
            },
        });

        if (!isPermission) {
            return false;
        }

        return true;
    }

    fastify.decorate("requiredPermission", (permission) => {
        return async (request, reply) => {
            const userRole = request.user.role;

            if (!userRole) {
                return reply.status(403).send({ error: "Forbidden: Role not found" });
            }

            const hasPerm = await hasPermission(permission, userRole);

            if (!hasPerm) {
                return reply.status(403).send({ message: "Forbidden: Insufficient permissions" });
            }
        }
    })
}

export default fp(permissionPlugin);