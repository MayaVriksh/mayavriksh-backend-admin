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
                origin: ["*"],
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

    // Cookie for system token
    server.state("mv_auth_token", {
        ttl: 24 * 60 * 60 * 1000, // 1 day
        isSecure: process.env.NODE_ENV === "production",
        // httpOnly: false,
        // sameSite: "Lax",
        encoding: "iron",
        password: process.env.COOKIE_SECRET
    });

    // Cookie for user token
    server.state("mv_user_token", {
        ttl: 24 * 60 * 60 * 1000,
        isSecure: process.env.NODE_ENV === "production",
        // httpOnly: false,
        // sameSite: "Lax",
        encoding: "iron",
        password: process.env.COOKIE_SECRET
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
