const state = new Map();

export function setPendingReply(ownerId, sessionId) {
    state.set(ownerId, { sessionId, at: Date.now() });
}

export function getPendingReply(ownerId) {
    const v = state.get(ownerId);
    if (!v) return null;
    if (Date.now() - v.at > 15 * 60 * 1000) {
        state.delete(ownerId);
        return null;
    }
    return v.sessionId;
}

export function clearPendingReply(ownerId) {
    state.delete(ownerId);
}
