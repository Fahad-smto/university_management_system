import { createClient } from 'redis';

export const redisClient = createClient({
    username: process.env.redis_user,
    password: process.env.redis_password,
    socket: {
        host: process.env.redis_host,
        port: Number(process.env.redis_port), 
    }
});