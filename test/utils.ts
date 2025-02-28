export function multiline(strings: TemplateStringsArray): string {
    const lines = strings.join('').split('\n');

    if (lines.length < 2) {
        return strings.join('');
    }

    const indent = lines[1].search(/\S/);

    return lines
        .map(line => line.slice(indent))
        .join('\n')
        .trim();
}
