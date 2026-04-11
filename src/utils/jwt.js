import { 
    JWT_ALGORITHM,
    JWT_ACCESS_EXPIRY,
    JWT_REFRESH_EXPIRY,

} from "../config/env.js";

export const generateAccessToken = (fastify, payload) => {
    return fastify.jwt.sign(payload, { expiresIn: JWT_ACCESS_EXPIRY, algorithm: JWT_ALGORITHM });
};

export const generateRefreshToken = (fastify, payload) => {
    return fastify.jwt.sign(payload, { expiresIn: JWT_REFRESH_EXPIRY, algorithm: JWT_ALGORITHM });
};

export const verifyToken = (fastify, token) => {
    try {
        return fastify.jwt.verify(token, { algorithms: [JWT_ALGORITHM] });
    } catch (err) {
        fastify.log.error("Token verification failed:", err);
        throw err;
    }
};