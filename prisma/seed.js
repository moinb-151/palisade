import { PrismaClient } from "../generated/prisma/client.ts";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const PERMISSIONS = ["create:roles", "create:permissions", "assign:roles", "update:roles", "ban:users", "read:profile", "update:profile"]

const ROLES = {
    "SUPER_ADMIN": PERMISSIONS,
    "ADMIN": ["assign:roles", "ban:users"],
    "USER": ["read:profile", "update:profile"],
}

async function main() {

    console.log("Seeding permissions and roles...");

    for (const permission of PERMISSIONS) {
        await prisma.permission.upsert({
            where: { action: permission },
            update: {},
            create: { action: permission }
        })
    }

    console.log("Permissions seeded.");

    for (const [name, permissions] of Object.entries(ROLES)) {

        const permissionRecords = await prisma.permission.findMany({
            where: { action: { in: permissions } }
        });

        const roleRecord = await prisma.role.upsert({
            where: { name },
            update: {
                permissions: {
                    set: permissionRecords.map(p => ({ id: p.id }))
                }
            },
            create: {
                name,
                permissions: {
                    connect: permissionRecords.map(p => ({ id: p.id }))
                }
            }
        });
        
        if (roleRecord.name === "SUPER_ADMIN") {

            const passwordHash = await bcrypt.hash("Moin@123", 12);

            await prisma.user.upsert({
                where: { username: "moin" },
                update: {},
                create: { username: "moin", roleId: roleRecord.id, passwordHash: passwordHash }
            });
        }
    }

    console.log("Roles seeded.");
    console.log("Seeding completed.");

}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });