import fs from 'fs';
import retryBotRequest from './retryBotRequest.js';

export default function editMessageMedia(pathOrFileId, caption, form = {}) {
    if (!form.chat_id || !form.message_id) {
        return null;
    }

    if (!pathOrFileId) {
        return null;
    }

    const media = fs.existsSync(pathOrFileId)
        ? `attach://${pathOrFileId}`
        : pathOrFileId;

    return retryBotRequest((bot) => bot.editMessageMedia({
        type: 'photo',
        media,
        caption
    }, form));
}
