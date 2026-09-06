import type { Server } from "http";
import app from "./app";
import config from "./config";
import prisma from "./lib/prisma";

let server: Server;

async function main() {
	try {
		await prisma.$connect();
		// eslint-disable-next-line no-console
		console.log("Database connected successfully");

		server = app.listen(config.port, () => {
			// eslint-disable-next-line no-console
			console.log(`Server is running on port ${config.port}`);
		});
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error("Failed to connect to the database", error);
	}
}

main();

process.on("unhandledRejection", () => {
	if (server) {
		server.close(() => {
			// eslint-disable-next-line no-console
			console.error("Unhandled rejection detected, shutting down server...");
			process.exit(1);
		});
	} else {
		process.exit(1);
	}
});

process.on("uncaughtException", () => {
	// eslint-disable-next-line no-console
	console.error("Uncaught exception detected, shutting down server...");
	process.exit(1);
});
