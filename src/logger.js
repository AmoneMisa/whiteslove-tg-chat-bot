function now() {
    return new Date().toISOString();
}

export function logInfo(message, payload = null) {
    console.log(`[${now()}] [INFO] ${message}`, payload ?? '');
}

export function logWarn(message, payload = null) {
    console.warn(`[${now()}] [WARN] ${message}`, payload ?? '');
}

export function logError(message, payload = null) {
    console.error(`[${now()}] [ERROR] ${message}`, payload ?? '');
}

export function logDebug(message, payload = null) {
    if (process.env.DEBUG === 'false') {
        return;
    }

    console.debug(`[${now()}] [DEBUG] ${message}`, payload ?? '');
}
