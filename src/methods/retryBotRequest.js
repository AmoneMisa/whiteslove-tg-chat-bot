import bot from '../bot.js';
import { logWarn } from '../logger.js';

function getRetryAfter(error) {
    if (error?.code !== 'ETELEGRAM') {
        return 1;
    }

    const errorCode = error?.response?.body?.error_code;

    if (errorCode === 400) {
        return -1;
    }

    if (errorCode === 429) {
        return error?.response?.body?.parameters?.retry_after || 1;
    }

    return 1;
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function retryBotRequest(request, maxRetries = 5) {
    let lastError = null;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await request(bot);
        } catch (error) {
            lastError = error;
            const retryAfter = getRetryAfter(error);

            logWarn('Bot request failed, retrying', {
                try: i + 1,
                retryAfter,
                message: error.message
            });

            if (retryAfter === -1) {
                break;
            }

            await sleep(retryAfter * 1000);
        }
    }

    throw lastError;
}
