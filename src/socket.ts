import http from 'http';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';

let io: Server | null = null;

// server চালুর সময় একবার call হবে
export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  // login করা user ছাড়া কেউ connect করতে পারবে না
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Unauthorized'));

    try {
      jwt.verify(token, process.env.JWT_ACCESS_SECRET as string);
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
  });

  return io;
};

// সব connected user কে event পাঠানো
export const emitToAll = (event: string, data: unknown) => {
  if (io) io.emit(event, data);
};