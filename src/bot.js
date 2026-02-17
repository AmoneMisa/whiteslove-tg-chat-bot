import TelegramBot from 'node-telegram-bot-api';
import { config } from './config.js';

const bot = new TelegramBot(config.botToken, { polling: config.polling });

export default bot;
