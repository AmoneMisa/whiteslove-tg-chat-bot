import bot from './bot.js';

function guessImageMimeByPath(path) {
    const p = (path || '').toLowerCase();
    if (p.endsWith('.png')) return { mime: 'image/png', ext: '.png' };
    if (p.endsWith('.webp')) return { mime: 'image/webp', ext: '.webp' };
    return { mime: 'image/jpeg', ext: '.jpg' };
}

export async function sendOwnerReplyMultipart({ sessionId, text, fileId }) {
    const backendUrl = (process.env.BACKEND_URL || '').replace(/\/$/, '');
    if (!backendUrl) throw new Error('BACKEND_URL is required');

    const safeText = (text || '').trim();

    if (!fileId) {
        const form = new FormData();
        form.set('sessionId', String(sessionId));
        form.set('text', safeText);

        const res = await fetch(`${backendUrl}/chat/owner-reply`, {
            method: 'POST',
            body: form,
        });

        if (!res.ok) throw new Error(`owner-reply failed: ${res.status}`);
        return;
    }

    const file = await bot.getFile(fileId);
    const filePath = file?.file_path;
    if (!filePath) throw new Error('Telegram file_path is missing');

    const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${filePath}`;

    const download = await fetch(fileUrl);
    if (!download.ok) throw new Error(`file download failed: ${download.status}`);

    const arrayBuffer = await download.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { mime, ext } = guessImageMimeByPath(filePath);
    const filename = `tg_${Date.now()}${ext}`;

    const form = new FormData();
    form.set('sessionId', String(sessionId));
    form.set('text', safeText);
    form.set('file', new Blob([buffer], { type: mime }), filename);

    const res = await fetch(`${backendUrl}/chat/owner-reply`, {
        method: 'POST',
        body: form,
    });

    if (!res.ok) throw new Error(`owner-reply upload failed: ${res.status}`);
}
