export default function setButtons(commands = []) {
    const textButtons = commands.map((command) => ({
        text: `/set${command[0].toUpperCase()}${command.slice(1)}`
    }));

    const keyboard = [];

    for (let i = 0; i < textButtons.length; i += 2) {
        keyboard.push(textButtons.slice(i, i + 2));
    }

    keyboard.push([{ text: '/remove_keyboard' }]);

    return keyboard;
}
