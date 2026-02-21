import bot from "./bot.js";
import { logDebug, logError, logInfo } from "./logger.js";
import commands from "./handlers/commands/index.js";
import callbacks from "./handlers/callbacks/index.js";
import { clearPendingReply, getPendingReply } from "./ownerState.js";

const ownerId = Number(process.env.OWNER_ID);

export default function registerHandlers({ chatBridge }) {
    for (const commandDef of commands) {
        bot.onText(commandDef.pattern, async (msg, match) => {
            try {
                await commandDef.handler(msg, match);
            } catch (error) {
                logError("Command handler failed", {
                    command: commandDef.command,
                    error: error.message,
                });
            }
        });
        logDebug("Registered command handler", { command: commandDef.command });
    }

    for (const callbackDef of callbacks) {
        bot.on("callback_query", async (query) => {
            if (query.data !== callbackDef.key) return;

            try {
                await callbackDef.handler(query);
            } catch (error) {
                logError("Callback handler failed", {
                    callback: callbackDef.key,
                    error: error.message,
                });
            }
        });

        logDebug("Registered callback handler", { callback: callbackDef.key });
    }

    bot.on("message", async (msg) => {
        if (msg.from?.id !== ownerId) return;

        const pending = getPendingReply(ownerId);
        if (!pending) return;

        const replyToId = msg.reply_to_message?.message_id;
        if (!replyToId) return;

        if (pending.replyMessageId && pending.replyMessageId !== replyToId) return;

        if (msg.text && !msg.text.startsWith("/")) {
            await chatBridge.ownerReply(pending.sessionId, { text: msg.text });
            clearPendingReply(ownerId);

        }
    });

    bot.on("polling_error", (error) => {
        logError("Polling error", error.message);
    });

    logInfo("All handlers registered");
}