import bot from "./bot.js";
import registerHandlers from "./registerHandlers.js";
import { logInfo } from "./logger.js";
import commands from "./handlers/commands/index.js";

import { createChatBridge } from "./chatBridge.js";
import { startNotifySubscriber } from "./notifySubscriber.js";
import {createRedisClients} from "./redis.js";

async function bootstrap() {
    const redisHost = process.env.REDIS_HOST || "redis";
    const redisPort = Number(process.env.REDIS_PORT || 6379);

    const { pub: redisPub, sub: redisSub } = createRedisClients({ host: redisHost, port: redisPort });
    const chatBridge = createChatBridge(redisPub);

    registerHandlers({ chatBridge });

    const ownerId = Number(process.env.OWNER_ID);
    startNotifySubscriber({ bot, redisSub, ownerId, chatBridge });

    await bot.setMyCommands(
        commands.map((item) => ({
            command: item.command.replace("/", ""),
            description: item.description,
        }))
    );

    logInfo("Bot started successfully");
}

bootstrap();