import bot from './bot.js';
import registerHandlers from './registerHandlers.js';
import { logInfo } from './logger.js';
import commands from './handlers/commands/index.js';

import { createRedisClients } from './redis.js';
import { createChatBridge } from './chatBridge.js';
import { startNotifySubscriber } from './notifySubscriber.js';

async function bootstrap() {
    const { pub, sub } = createRedisClients({
        host: process.env.REDIS_HOST || 'redis',
        port: Number(process.env.REDIS_PORT || 6379),
    });

    const chatBridge = createChatBridge(pub);

    registerHandlers({ chatBridge });

    startNotifySubscriber({
        bot,
        redisSub: sub,
        ownerId: Number(process.env.OWNER_ID),
        chatBridge,
    });

    await bot.setMyCommands(
        commands.map((item) => ({
            command: item.command.replace('/', ''),
            description: item.description,
        }))
    );

    logInfo('Bot started successfully');
}

bootstrap();
