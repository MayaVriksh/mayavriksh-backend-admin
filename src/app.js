/*
 * Application initialization and configuration.
 */

const Hapi = require("@hapi/hapi");
const Inert = require("@hapi/inert");
const Vision = require("@hapi/vision");
const HapiSwagger = require("hapi-swagger");
const baseRoutes = require("./routes/base.route");

const createServer = async () => {
    const server = Hapi.server({
        port: process.env.PORT || 5500,
        host: process.env.HOST || "localhost",
        routes: {
            cors: {
                // origin: process.env.NODE_ENV === "production" ? ["https://your-frontend-domain.com"] : ["http://localhost:5000", "http://localhost:5500"],
                origin : ["*"],
                headers: ["Authorization", "Content-Type", "If-None-Match"],
                exposedHeaders: ["WWW-Authenticate", "Server-Authorization"],
                additionalExposedHeaders: ["X-Custom-Header"],
                maxAge: 60,
                credentials: true
            },
            state: {
                parse: true,
                failAction: "ignore"
            }
        }
    });

// --- REWRITTEN & SECURED COOKIE CONFIGURATION ---
    // This cookie is ONLY for the long-lived Refresh Token.
    server.state("mv_refresh_token", {
        ttl: 7 * 24 * 60 * 60 * 1000, // 7 days, matches refresh token expiry
        isSecure: process.env.NODE_ENV === "production", // MUST be true in production (requires HTTPS)
        // isHttpOnly: true, // CRITICAL: Prevents client-side JS from accessing the cookie (XSS protection)
        // sameSite: "Lax", // CRITICAL: Best protection against CSRF attacks for auth tokens in cross-sites, like communication between a.com & b.com
        // path: "/", // Ensure the cookie is accessible across the site
        encoding: "iron", // Hapi's session encryption is great
        password: process.env.COOKIE_SECRET // Ensure this is a long, complex secret
    });
    await server.register([
        Inert,
        Vision,
        {
            plugin: HapiSwagger,
            options: {
                info: {
                    title: "Mayavriksh API Documentation",
                    version: "1.0.0",
                    description: "API for Mayavriksh backend"
                },
                schemes: ["http", "https"],
                grouping: "tags",
                swaggerUI: true,
                documentationPage: true,
                documentationPath: "/mayavriksh-docs",
                consumes: ["application/json"],
                produces: ["application/json"],
                securityDefinitions: {
                    jwt: {
                        type: "apiKey",
                        name: "Authorization",
                        in: "header",
                        description:
                            "JWT authorization header using the Bearer scheme"
                    }
                },
                security: [{ jwt: [] }]
            }
        }
    ]);

    server.route({
        method: "GET",
        path: "/",
        handler: () => "<h3>Welcome to Mayavriksh API!</h3>"
    });

    await server.register({
        plugin: baseRoutes,
        routes: {
            prefix: "/api"
        }
    });

    return server;
};

module.exports = createServer;
