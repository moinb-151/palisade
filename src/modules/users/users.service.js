import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";

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