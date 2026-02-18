import { shouldSendNow } from "./antiSpam.js";
import { setPendingReply } from "./ownerState.js";

function parseMessage(m) {
    if (Buffer.isBuffer(m)) return JSON.parse(m.toString("utf8"));
    return JSON.parse(m);
}

function ownerKeyboard(payload) {
    const sessionId = Number(payload.sessionId);
    if (payload.source === "telegram") {
        return {
            inline_keyboard: [
                [{ text: "Связался", callback_data: `contacted:${sessionId}` }],
                [{ text: "Закрыть чат", callback_data: `close:${sessionId}` }],
            ],
        };
    }
    return {
        inline_keyboard: [
            [{ text: "Ответить", callback_data: `reply:${sessionId}` }],
            [{ text: "Закрыть чат", callback_data: `close:${sessionId}` }],
        ],
    };
}

function formatOwnerText(payload) {
    const type = payload.source === "telegram" ? "Telegram" : "Сайт";
    const tg = payload.source === "telegram" && payload.tgUsername ? `\nНик пользователя: ${payload.tgUsername}` : "";
    const text = payload.text ? `\nСообщение: ${payload.text}` : "";
    return `Новое сообщение.\nТип: ${type}${tg}${text}`;
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
            setPendingReply(ownerId, sessionId);
            try { await bot.answerCallbackQuery(q.id, { text: "Напишите ответ следующим сообщением" }); } catch {}
            return;
        }

        if (action === "close") {
            await chatBridge.closeSession(sessionId, "closed_by_owner");
            try { await bot.answerCallbackQuery(q.id, { text: "Чат закрыт" }); } catch {}
            return;
        }

        if (action === "contacted") {
            await chatBridge.closeSession(sessionId, "contacted");
            try { await bot.answerCallbackQuery(q.id, { text: "Сессия закрыта" }); } catch {}
            return;
        }

        try { await bot.answerCallbackQuery(q.id); } catch {}
    });
}
