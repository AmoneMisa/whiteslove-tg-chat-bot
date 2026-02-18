export function createChatBridge(redisPub) {
    async function ownerReply(sessionId, payload) {
        await redisPub.publish(
            'tg.owner_reply',
            JSON.stringify({ sessionId, ...payload })
        );
    }

    async function closeSession(sessionId, reason = 'closed_by_owner') {
        await redisPub.publish(
            'tg.session_close',
            JSON.stringify({ sessionId, reason })
        );
    }

    return { ownerReply, closeSession };
}