import fs from 'fs';
import path from 'path';

export default function loadEnv(fileName = '.env') {
    const envPath = path.resolve(process.cwd(), fileName);

    if (!fs.existsSync(envPath)) {
        return;
    }

    const lines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/);

    for (const rawLine of lines) {
        const line = rawLine.trim();

        if (!line || line.startsWith('#')) {
            continue;
        }

        const index = line.indexOf('=');
        if (index === -1) {
            continue;
        }

        const key = line.slice(0, index).trim();
        const value = line.slice(index + 1).trim();

        if (!(key in process.env)) {
            process.env[key] = value;
        }
    }
}
