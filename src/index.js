import bot from './bot.js';
import registerHandlers from './registerHandlers.js';
import { logInfo } from './logger.js';
import commands from './handlers/commands/index.js';

async function bootstrap() {
    registerHandlers();

    await bot.setMyCommands(
        commands.map((item) => ({
            command: item.command.replace('/', ''),
            description: item.description
        }))
    );

    logInfo('Bot started successfully');
}

bootstrap();
