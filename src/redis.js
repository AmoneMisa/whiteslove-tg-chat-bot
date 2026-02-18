import Redis from "ioredis";

export function createRedisClients({ host, port }) {
    const pub = new Redis({ host, port });
    const sub = new Redis({ host, port });
    return { pub, sub };
}
