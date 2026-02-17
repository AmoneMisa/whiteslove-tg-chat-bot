import sendMessage from '../../methods/sendMessage.js';

const callbacks = [
    {
        key: 'ping',
        handler: async (query) => {
            return sendMessage(query.message.chat.id, 'pong');
        }
    }
];

export default callbacks;
