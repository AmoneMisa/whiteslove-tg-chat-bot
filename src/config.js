import loadEnv from './loadEnv.js';

loadEnv();

const requiredKeys = ['BOT_TOKEN', 'OWNER_ID'];

for (const key of requiredKeys) {
    if (!process.env[key]) {
        throw new Error(`Missing required env variable: ${key}`);
    }
}

export const config = {
    botToken: process.env.BOT_TOKEN,
    ownerId: Number(process.env.OWNER_ID),
    botName: process.env.BOT_NAME || 'genshin-template-bot',
    debug: process.env.DEBUG !== 'false',
    polling: process.env.POLLING !== 'false'
};
