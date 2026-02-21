import { shouldSendNow } from "./antiSpam.js";
import { setPendingReply, clearPendingReply } from "./ownerState.js";

function parseMessage(m) {
    if (Buffer.isBuffer(m)) return JSON.parse(m.toString("utf8"));
    return JSON.parse(m);
}

function ownerKeyboard(payload) {
    const sessionId = Number(payload.sessionId);
    if (!sessionId) return { inline_keyboard: [] };

    if (payload.source === "telegram") {
        return {
            inline_keyboard: [
                [{ text: `Ответить (#${sessionId})`, callback_data: `reply:${sessionId}` }],
                [{ text: `Связался (#${sessionId})`, callback_data: `contacted:${sessionId}` }],
                [{ text: `Закрыть чат (#${sessionId})`, callback_data: `close:${sessionId}` }],
            ],
        };
    }

    return {
        inline_keyboard: [
            [{ text: `Ответить (#${sessionId})`, callback_data: `reply:${sessionId}` }],
            [{ text: `Закрыть чат (#${sessionId})`, callback_data: `close:${sessionId}` }],
        ],
    };
}

function formatOwnerText(payload) {
    const sessionId = Number(payload.sessionId);
    const type = payload.source === "telegram" ? "Telegram" : "Сайт";
    const header = sessionId ? `Новое сообщение (сессия #${sessionId}).` : "Новое сообщение.";

    const tg = payload.source === "telegram" && payload.tgUsername ? `\nНик пользователя: ${payload.tgUsername}` : "";
    const text = payload.text ? `\nСообщение: ${payload.text}` : "";

    return `${header}\nТип: ${type}${tg}${text}`;
}

async function removeKeyboardSafely(bot, q) {
    const chatId = q?.message?.chat?.id;
    const messageId = q?.message?.message_id;
    if (!chatId || !messageId) return;

    try {
        await bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: chatId, message_id: messageId });
    } catch {}
}

export function startNotifySubscriber({ bot, redisSub, ownerId, chatBridge }) {
    redisSub.subscribe("tg.notify");

    redisSub.on("message", async (_ch, msg) => {
        let payload;
        try {
            payload = parseMessage(msg);
        } catch {
            return;
        }

        const sessionId = Number(payload.sessionId);
        if (!sessionId) return;

        const spamKey = `owner:${ownerId}:session:${sessionId}`;
        if (!shouldSendNow(spamKey, 1500)) return;

        const text = formatOwnerText(payload);
        const reply_markup = ownerKeyboard(payload);

        try {
            await bot.sendMessage(ownerId, text, { reply_markup });
        } catch {}
    });

    bot.on("callback_query", async (q) => {
        const fromId = q?.from?.id;
        if (fromId !== ownerId) {
            try { await bot.answerCallbackQuery(q.id); } catch {}
            return;
        }

        const data = q.data || "";
        const [action, idStr] = data.split(":");
        const sessionId = Number(idStr);

        if (!sessionId) {
            try { await bot.answerCallbackQuery(q.id); } catch {}
            return;
        }

        if (action === "reply") {
            try {
                const sent = await bot.sendMessage(
                    ownerId,
                    `Ответьте на это сообщение — я отправлю ответ в сессию #${sessionId}`,
                    { reply_markup: { force_reply: true } }
                );
                setPendingReply(ownerId, sessionId, sent?.message_id || 0);
            } catch {
                setPendingReply(ownerId, sessionId, 0);
            }

            try { await bot.answerCallbackQuery(q.id, { text: `Ожидаю ответ для #${sessionId}` }); } catch {}
            return;
        }

        if (action === "close") {
            await chatBridge.closeSession(sessionId, "closed_by_owner");
            await removeKeyboardSafely(bot, q);
            clearPendingReply(ownerId);
            try { await bot.answerCallbackQuery(q.id, { text: `Чат #${sessionId} закрыт` }); } catch {}
            return;
        }

        if (action === "contacted") {
            await chatBridge.closeSession(sessionId, "contacted");
            await removeKeyboardSafely(bot, q);
            clearPendingReply(ownerId);
            try { await bot.answerCallbackQuery(q.id, { text: `Сессия #${sessionId} закрыта` }); } catch {}
            return;
        }

        try { await bot.answerCallbackQuery(q.id); } catch {}
    });
}