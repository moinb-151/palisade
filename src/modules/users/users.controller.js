import { loginUser } from "./users.service.js";
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
        if (error.name === "ZodError") {
            return reply.status(400).send({
                message: "Validation failed",
                errors: error.issues.map((err) => ({
                    field: err.path[0],
                    message: err.message,
                })),
            });
        }
        return reply.status(401).send({ error: error.message });
    }
}