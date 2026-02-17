import retryBotRequest from './retryBotRequest.js';

export default function editMessageText(text, form = {}) {
    if (!form.chat_id || !form.message_id) {
        return null;
    }

    return retryBotRequest((bot) => bot.editMessageText(text, form));
}
