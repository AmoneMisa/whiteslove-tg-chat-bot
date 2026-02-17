import { config } from '../config.js';
import sendMessage from './sendMessage.js';

export default async function debugMessage(message, options = {}) {
    const text = typeof message === 'string' ? message : JSON.stringify(message, null, 2);
    return sendMessage(config.ownerId, `🐞 DEBUG\n\n${text}`, options);
}
