import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
import { JWT_REFRESH_EXPIRY_SECONDS } from "../../config/env.js";
import redis from "../../config/redis.js";

export const createUser = async (fastify, username, password) => {
    const prisma = fastify.prisma;

    const existingUser = await prisma.user.findUnique({
        where: { username },
    });

    if (existingUser) {
        throw new Error("Username already exists");
    }

    const userRole = await prisma.role.findUnique({
        where: { name: "USER" },
    });

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
        data: {
            username,
            passwordHash,
            roleId: userRole.id
        },
        select: {
            id: true,
            username: true,
            role: {
                select: {
                    id: true,
                    name: true,
                }
            }
        }
    });

    return user;
}

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

    await redis.set(`refresh_token:${user.id}`, refreshToken, "EX", JWT_REFRESH_EXPIRY_SECONDS);

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

export const getRoles = async (fastify, skip = 0, limit = 10) => {

    const prisma = fastify.prisma;

    const [roles, totalRecords] = await prisma.$transaction([
        prisma.role.findMany({
            skip,
            take: limit,
            include: { permissions: true },
            orderBy: { name: "asc" },
        }),
        prisma.role.count(),
    ]);

    const totalPages = Math.ceil(totalRecords / limit);

    return { roles, totalRecords, totalPages };
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

export const getPermissions = async (fastify, skip = 0, limit = 10) => {
    const prisma = fastify.prisma;

    const [permissions, totalRecords] = await prisma.$transaction([
        prisma.permission.findMany({
            skip,
            take: limit,
            orderBy: { action: "asc" },
        }),
        prisma.permission.count(),
    ]);

    const totalPages = Math.ceil(totalRecords / limit);

    return { permissions, totalRecords, totalPages };
}

export const updateUserRole = async (fastify, userId, roleName) => {
    const prisma = fastify.prisma;

    const role = await prisma.role.findUnique({
        where: { name: roleName },
    });

    if (!role) {
        throw new Error("Role not found");
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error("User not found");
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { roleId: role.id },
        select: {
            id: true,
            username: true,
            role: {
                select: {
                    id: true,
                    name: true,
                }
            }   
        }
    });

    return updatedUser;
}

export const updateRolePermissions = async (fastify, roleName, permissionsToAdd = [], permissionsToRemove = []) => {
    const prisma = fastify.prisma;

    const role = await prisma.role.findUnique({
        where: { name: roleName },
        include: { permissions: true },
    });

    if (!role) {
        throw new Error("Role not found");
    }

    const permissionRecordsToAdd = await prisma.permission.findMany({
        where: { action: { in: permissionsToAdd } },
    });

    const permissionRecordsToRemove = await prisma.permission.findMany({
        where: { action: { in: permissionsToRemove } },
    });

    if (permissionRecordsToAdd.length !== permissionsToAdd.length || 
        permissionRecordsToRemove.length !== permissionsToRemove.length) {
        throw new Error("One or more permissions to add or remove not found");
    }

    const updatedRole = await prisma.role.update({
        where: { name: roleName },
        data: {
            permissions: {
                connect: permissionRecordsToAdd.map(p => ({ id: p.id })),
                disconnect: permissionRecordsToRemove.map(p => ({ id: p.id })),
            },
        }
    });

    return updatedRole;
}

export const checkIsBanned = async (fastify, { id, role }) => {
    const prisma = fastify.prisma;

    const roleRecord = await prisma.role.findUnique({
        where: { name: role }
    });

    if (!roleRecord) {
        throw new Error("Role not found");
    }

    const user = await prisma.user.findUnique({
        where: { 
            id, 
            roleId: roleRecord.id 
        },
    });

    if (!user) {
        throw new Error("User not found")
    }

    return user.isBanned
}