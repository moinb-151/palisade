import { 
    loginUser, 
    createRole,
    getRoles,
    createPermission,
    getPermissions,
    updateUserRole,
 } from "./users.service.js";
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
            return reply.status(400).send({ error: error.message });
        }

        if (error.message === "Role with this name already exists") {
            return reply.status(400).send({ error: error.message });
        }

        request.log.error("Create Role Route Crash:", error);
        return reply.status(500).send({ error: "Internal server error" });
    }
}

export const getRolesHandler = async (request, reply) => {
    const { page = 1, limit = 10 } = request.query;

    const skip = (page - 1) * limit;

    try {
        const { roles, totalRecords, totalPages } = await getRoles(request.server, skip, limit);

        return reply.status(200).send({
            data: roles,
            meta: {
                totalRecords,
                totalPages,
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        request.log.error("Get Roles Route Crash:", error);
        return reply.status(500).send({ error: "Internal server error" });
    }
}

export const createPermissionHandler = async (request, reply) => {
    const { action } = request.body;

    if (!action || typeof action !== "string") {
        return reply.status(400).send({ error: "Action is required and must be a string" });
    }

    try {
        const permission = await createPermission(request.server, action);
        return reply.status(201).send({ message: "Permission created successfully", permission });
    } catch (error) {
        if (error.message === "Permission with this action already exists") {
            return reply.status(400).send({ error: error.message });
        }

        request.log.error("Create Permission Route Crash:", error);
        return reply.status(500).send({ error: "Internal server error" });
    }
}

export const getPermissionsHandler = async (request, reply) => {
    const { page = 1, limit = 10 } = request.query;

    const skip = (page - 1) * limit;

    try {
        const { permissions, totalRecords, totalPages } = await getPermissions(request.server, skip, limit);

        return reply.status(200).send({
            data: permissions,
            meta: {
                totalRecords,
                totalPages,
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        request.log.error("Get Permissions Route Crash:", error);
        return reply.status(500).send({ error: "Internal server error" });
    }
}

export const updateUserRoleHandler = async (request, reply) => {
    const { userId } = request.params;
    const { roleName } = request.body;

    try {
        const updatedUser = await updateUserRole(request.server, userId, roleName);
        return reply.status(200).send({ message: "User role updated successfully", user: updatedUser });
    } catch (error) {
        if (error.message === "Role not found" || error.message === "User not found") {
            return reply.status(404).send({ error: error.message });
        }

        request.log.error("Update User Role Route Crash:", error);
        return reply.status(500).send({ error: "Internal server error" });
    }
}