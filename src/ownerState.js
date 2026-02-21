const pendingByOwner = new Map();

export function setPendingReply(ownerId, sessionId, replyMessageId) {
    pendingByOwner.set(String(ownerId), {
        sessionId: Number(sessionId),
        replyMessageId: Number(replyMessageId || 0),
        createdAt: Date.now(),
    });
}

export function getPendingReply(ownerId) {
    const v = pendingByOwner.get(String(ownerId));
    if (!v) return null;

    if (Date.now() - v.createdAt > 10 * 60 * 1000) {
        pendingByOwner.delete(String(ownerId));
        return null;
    }

    return v;
}

export function clearPendingReply(ownerId) {
    pendingByOwner.delete(String(ownerId));
}