/*
 * Entry point: starts the server and handles process-level events.
 */

require("dotenv").config();
const createServer = require("./app");

const startServer = async () => {
    try {
        const server = await createServer();
        await server.start();
        console.log(`Server running at: ${server.info.uri}`);
        console.log(`Swagger docs: ${server.info.uri}/mayavriksh-docs`);
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

// Handle unhandled rejections
process.on("unhandledRejection", (error) => {
    console.error("Unhandled rejection:", error);
    //   process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
    //   process.exit(1);
});

// Graceful shutdown on SIGINT/SIGTERM
process.on("SIGTERM", () => {
    console.log("Received SIGTERM, shutting down gracefully...");
    //   process.exit(0);
});

process.on("SIGINT", () => {
    console.log("Received SIGINT, shutting down gracefully...");
    //   process.exit(0);
});

startServer();
