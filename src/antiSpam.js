const lastSent = new Map();

export function shouldSendNow(key, ms) {
    const now = Date.now();
    const last = lastSent.get(key) || 0;
    if (now - last < ms) return false;
    lastSent.set(key, now);
    return true;
}
