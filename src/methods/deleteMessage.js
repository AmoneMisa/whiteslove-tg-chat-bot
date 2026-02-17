import retryBotRequest from './retryBotRequest.js';
import { logWarn } from '../logger.js';

export default async function deleteMessage(chatId, messageId) {
    if (!messageId) {
        return null;
    }

    try {
        return await retryBotRequest((bot) => bot.deleteMessage(chatId, messageId));
    } catch (error) {
        logWarn('Failed to delete message', { chatId, messageId, error: error.message });
        return null;
    }
}
