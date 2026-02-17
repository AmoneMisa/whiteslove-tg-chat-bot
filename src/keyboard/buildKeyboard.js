export default function buildKeyboard(items = [], columns = 2) {
    const rows = [];

    for (let i = 0; i < items.length; i += columns) {
        rows.push(items.slice(i, i + columns));
    }

    return rows;
}
