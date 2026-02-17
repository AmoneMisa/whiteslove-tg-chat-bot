import retryBotRequest from './retryBotRequest.js';
import { logError } from '../logger.js';

export default async function sendMessage(chatId, text, options = {}) {
    try {
        return await retryBotRequest((bot) => bot.sendMessage(chatId, text, options));
    } catch (error) {
        logError('Failed to send message', { chatId, text, error: error.message });
        throw error;
    }
}
