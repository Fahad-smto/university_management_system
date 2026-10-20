import http, { Server } from 'http';
import app from './app';
import config from './config';
import prisma from './lib/prisma';
import seed from './seed';
import redisClient from './lib/redis';
import { initSocket } from './socket';

let server: Server;

async function main() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');

    await redisClient.connect();

    console.log('Redis connected successfully');
 
    await seed();
 
    server = http.createServer(app);
    initSocket(server);

    server.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to connect to the database', error);
  }
}

main();

process.on('unhandledRejection', () => {
  if (server) {
    server.close(() => {
      console.error('Unhandled rejection detected, shutting down server...');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on('uncaughtException', () => {
  console.error('Uncaught exception detected, shutting down server...');
  process.exit(1);
});