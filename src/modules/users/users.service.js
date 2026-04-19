import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
import fastify from "fastify";

export const loginUser = async (fastify, username, password) => {

    const prisma = fastify.prisma;

    const user = await prisma.user.findUnique({
        where: { 
            username,
        },
        include: { 
            role: {
                select: {
                    id: true,
                    name: true
                }
            }
        },
    });

    if (!user) {
        throw new Error("Invalid username or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
        throw new Error("Invalid credentials");
    }

    const payload = { id: user.id, role: user.role.name };

    const accessToken = generateAccessToken(fastify, payload);
    const refreshToken = generateRefreshToken(fastify, payload);

    return { accessToken, refreshToken };
}

export const createRole = async (fastify, roleName, permissions) => {
    const prisma = fastify.prisma;

    const permissionRecords = await prisma.permission.findMany({
        where: { action: { in: permissions } },
    });

    if (permissionRecords.length !== permissions.length) {
        throw new Error("One or more permissions not found");
    }

    const existingRole = await prisma.role.findUnique({
        where: { name: roleName },
    });

    if (existingRole) {
        throw new Error("Role with this name already exists");
    }

    const role = await prisma.role.create({
        data: {
            name: roleName,
            permissions: {
                connect: permissionRecords.map(p => ({ id: p.id })),
            },
        },
    });

    return role;
}

export const createPermission = async (fastify, action) => {
    const prisma = fastify.prisma;

    const existingPermission = await prisma.permission.findUnique({
        where: { action },
    });

    if (existingPermission) {
        throw new Error("Permission with this action already exists");
    }

    const permission = await prisma.permission.create({
        data: { action },
    })

    return permission;
}