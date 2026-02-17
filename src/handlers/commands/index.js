import sendMessage from '../../methods/sendMessage.js';
import debugMessage from '../../methods/debugMessage.js';

const commands = [
    {
        command: '/start',
        description: 'Запуск шаблонного бота',
        pattern: /^\/start$/,
        handler: async (msg) => sendMessage(msg.chat.id, 'Бот запущен. Используй /help')
    },
    {
        command: '/help',
        description: 'Список команд',
        pattern: /^\/help$/,
        handler: async (msg) => sendMessage(msg.chat.id, 'Доступные команды: /start, /help, /debug')
    },
    {
        command: '/debug',
        description: 'Отправить debug владельцу',
        pattern: /^\/debug$/,
        handler: async (msg) => {
            await debugMessage({ from: msg.from?.id, chat: msg.chat.id, text: msg.text });
            return sendMessage(msg.chat.id, 'Debug отправлен владельцу.');
        }
    }
];

export default commands;
