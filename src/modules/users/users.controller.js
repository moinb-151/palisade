import { loginUser, createRole } from "./users.service.js";
import { 
    JWT_ACCESS_EXPIRY_SECONDS, 
    JWT_REFRESH_EXPIRY_SECONDS, 
    COOKIE_HTTP_ONLY,
    COOKIE_SECURE,
    COOKIE_SAME_SITE
} from "../../config/env.js";

const COOKIE_OPTIONS = {
    httpOnly: COOKIE_HTTP_ONLY,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAME_SITE,
    path: "/",
};

export const loginHandler = async (request, reply) => {
    const { username, password } = request.body;

    try {
        const { accessToken, refreshToken } = await loginUser(request.server, username, password);

        return reply
            .setCookie("access_token", accessToken, { ...COOKIE_OPTIONS, maxAge: JWT_ACCESS_EXPIRY_SECONDS })
            .setCookie("refresh_token", refreshToken, { ...COOKIE_OPTIONS, maxAge: JWT_REFRESH_EXPIRY_SECONDS })
            .send({ message: "Login successful" });

    } catch (error) {
        if (error.message === "Invalid credentials") {
            return reply.status(401).send({ error: "Invalid username or password" });
        }

        request.log.error("Login Route Crash:", error);
        return reply.status(500).send({ error: "Internal server error" });
    }
}

export const createRoleHandler = async (request, reply) => {
    const { roleName, permissions } = request.body;

    try {
        const role = await createRole(request.server, roleName, permissions);
        return reply.status(201).send({ message: "Role created successfully", role });
    } catch (error) {
        if (error.message === "One or more permissions not found") {
            return reply.status(400).send({ error: "One or more permissions not found" });
        }

        if (error.message === "Role with this name already exists") {
            return reply.status(400).send({ error: "Role with this name already exists" });
        }

        request.log.error("Create Role Route Crash:", error);
        return reply.status(500).send({ error: "Internal server error" });
    }
}