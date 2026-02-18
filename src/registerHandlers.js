import bot from './bot.js';
import {logDebug, logError, logInfo} from './logger.js';
import commands from './handlers/commands/index.js';
import callbacks from './handlers/callbacks/index.js';
import {clearPendingReply, getPendingReply} from './ownerState.js';
import {sendOwnerReplyMultipart} from './httpOwnerReply.js';

const ownerId = Number(process.env.OWNER_ID);

export default function registerHandlers({chatBridge}) {
    for (const commandDef of commands) {
        bot.onText(commandDef.pattern, async (msg, match) => {
            try {
                await commandDef.handler(msg, match);
            } catch (error) {
                logError('Command handler failed', {
                    command: commandDef.command,
                    error: error?.message || String(error),
                });
            }
        });

        logDebug('Registered command handler', {command: commandDef.command});
    }

    const callbackMap = new Map(callbacks.map((c) => [c.key, c.handler]));

    bot.on('callback_query', async (query) => {
        const key = query?.data;
        const handler = callbackMap.get(key);
        if (!handler) return;

        try {
            await handler(query);
        } catch (error) {
            logError('Callback handler failed', {
                callback: key,
                error: error?.message || String(error),
            });
        }
    });

    for (const callbackDef of callbacks) {
        logDebug('Registered callback handler', {callback: callbackDef.key});
    }

    bot.on('message', async (msg) => {
        if (msg.from?.id !== ownerId) return;

        const sessionId = getPendingReply(ownerId);
        if (!sessionId) return;

        try {
            if (msg.text && !msg.text.startsWith('/')) {
                await sendOwnerReplyMultipart({
                    sessionId,
                    text: msg.text,
                    fileId: null,
                });

                clearPendingReply(ownerId);
                return;
            }

            if (msg.photo?.length) {
                const p = msg.photo[msg.photo.length - 1];

                await sendOwnerReplyMultipart({
                    sessionId,
                    text: msg.caption || '',
                    fileId: p.file_id,
                });

                clearPendingReply(ownerId);
            }
        } catch (error) {
            logError('Owner reply failed', {
                sessionId,
                error: error?.message || String(error),
            });
        }
    });

    bot.on('polling_error', (error) => {
        logError('Polling error', error?.message || String(error));
    });

    logInfo('All handlers registered');
}
