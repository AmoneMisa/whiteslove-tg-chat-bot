import fs from 'fs';
import retryBotRequest from './retryBotRequest.js';

export default function sendPhoto(chatId, pathOrFileId, options = {}) {
    const photo = fs.existsSync(pathOrFileId)
        ? fs.createReadStream(pathOrFileId)
        : pathOrFileId;

    return retryBotRequest((bot) => bot.sendPhoto(chatId, photo, options));
}
