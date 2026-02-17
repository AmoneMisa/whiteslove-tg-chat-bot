import editMessageText from './editMessageText.js';
import retryBotRequest from './retryBotRequest.js';

export default function editMessageCaption(text, form = {}, hasPhoto = null) {
    if (!form.chat_id || !form.message_id) {
        return null;
    }

    if (hasPhoto !== null && hasPhoto !== undefined) {
        return retryBotRequest((bot) => bot.editMessageCaption(text, form));
    }

    return editMessageText(text, form);
}
