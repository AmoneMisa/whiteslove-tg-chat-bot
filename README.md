# Genshin Impact TG Bot — Template Repo

Готовый template-репозиторий на базе текущего проекта для быстрого старта Telegram-бота.

## Зачем нужен `config.js`

`src/config.js` — это единая точка конфигурации приложения:
- грузит `.env` через `loadEnv`;
- валидирует обязательные переменные (`BOT_TOKEN`, `OWNER_ID`);
- отдает готовый объект `config` для всего проекта.

Это убирает «размазанные» чтения `process.env` по файлам и упрощает поддержку.

## Что внутри

- Лог-методы: `logInfo`, `logWarn`, `logError`, `logDebug`.
- Telegram-методы:
  - `sendMessage(chatId, text, options)`
  - `deleteMessage(chatId, messageId)`
  - `debugMessage(message, options)`
  - `editMessageText(text, form)`
  - `editMessageCaption(text, form, hasPhoto)`
  - `editMessageMedia(pathOrFileId, caption, form)`
  - `sendPhoto(chatId, pathOrFileId, options)`
  - `retryBotRequest(request, maxRetries)`
- Методы построения кнопок:
  - `buildKeyboard(items, columns)`
  - `setButtons(commands)`
- Команды и callback-хендлеры подключаются **в цикле** (`for...of`) через `registerHandlers`.
- Точка запуска бота: `src/index.js`.
- Шаблон окружения: `.env.example`.

## Структура

```text
template-repo/
  .env.example
  README.md
  src/
    index.js
    bot.js
    config.js
    loadEnv.js
    logger.js
    registerHandlers.js
    keyboard/
      buildKeyboard.js
      setButtons.js
    methods/
      retryBotRequest.js
      sendMessage.js
      deleteMessage.js
      debugMessage.js
      editMessageText.js
      editMessageCaption.js
      editMessageMedia.js
      sendPhoto.js
    handlers/
      commands/index.js
      callbacks/index.js
```

## Быстрый старт

1. Скопируй `.env.example` в `.env`.
2. Заполни `BOT_TOKEN` и `OWNER_ID`.
3. Запусти:

```bash
node template-repo/src/index.js
```

## Описание методов

### Логи

- `logInfo(message, payload?)` — информационные логи.
- `logWarn(message, payload?)` — предупреждения.
- `logError(message, payload?)` — ошибки.
- `logDebug(message, payload?)` — debug-логи (отключаются при `DEBUG=false`).

### Telegram-обёртки

- `sendMessage(chatId, text, options?)` — отправка сообщений c retry.
- `deleteMessage(chatId, messageId)` — удаление сообщений c retry.
- `debugMessage(message, options?)` — отправка debug-сообщения владельцу.
- `editMessageText(text, form)` — редактирование текста сообщения.
- `editMessageCaption(text, form, hasPhoto)` — редактирование caption (или fallback в text).
- `editMessageMedia(pathOrFileId, caption, form)` — редактирование медиа.
- `sendPhoto(chatId, pathOrFileId, options?)` — отправка фото из `file_id` или локального файла.
- `retryBotRequest(request, maxRetries?)` — универсальная retry-обёртка для Telegram API запросов.

### Построение кнопок

- `buildKeyboard(items, columns?)` — разбивает массив кнопок на ряды по количеству колонок.
- `setButtons(commands)` — генерирует кнопки вида `/setXxx` и добавляет `/remove_keyboard`.

## Команды и хендлеры в цикле

- Команды задаются в `src/handlers/commands/index.js`.
- Callback-хендлеры задаются в `src/handlers/callbacks/index.js`.
- В `src/registerHandlers.js` всё регистрируется в цикле (`for...of`) и логируется.
