import bot from './bot.js';
import { logDebug, logError, logInfo } from './logger.js';
import commands from './handlers/commands/index.js';
import callbacks from './handlers/callbacks/index.js';

export default function registerHandlers() {
    // Регистрируем команды и хендлеры в цикле
    for (const commandDef of commands) {
        bot.onText(commandDef.pattern, async (msg, match) => {
            try {
                await commandDef.handler(msg, match);
            } catch (error) {
                logError('Command handler failed', {
                    command: commandDef.command,
                    error: error.message
                });
            }
        });
        logDebug('Registered command handler', { command: commandDef.command });
    }

    for (const callbackDef of callbacks) {
        bot.on('callback_query', async (query) => {
            if (query.data !== callbackDef.key) {
                return;
            }

            try {
                await callbackDef.handler(query);
            } catch (error) {
                logError('Callback handler failed', {
                    callback: callbackDef.key,
                    error: error.message
                });
            }
        });

        logDebug('Registered callback handler', { callback: callbackDef.key });
    }

    bot.on('polling_error', (error) => {
        logError('Polling error', error.message);
    });

    logInfo('All handlers registered');
}
