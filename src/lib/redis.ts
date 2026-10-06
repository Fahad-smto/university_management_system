import { createClient } from 'redis';

export const redis = createClient({
    username: process.env.redis_user,
    password: process.env.redis_password,
    socket: {
        host: process.env.redis_host,
        port: Number(process.env.redis_port), 
    }
});

export default redis;