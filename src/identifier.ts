// https://262.ecma-international.org/14.0/#sec-keywords-and-reserved-words
// 14 is ES2023
export const reservedIdentifiers = [
    // Keywords
    'await',
    'break',
    'case',
    'catch',
    'class',
    'const',
    'continue',
    'debugger',
    'default',
    'delete',
    'do',
    'else',
    'enum',
    'export',
    'extends',
    'false',
    'finally',
    'for',
    'function',
    'if',
    'import',
    'in',
    'instanceof',
    'new',
    'null',
    'return',
    'super',
    'switch',
    'this',
    'throw',
    'true',
    'try',
    'typeof',
    'var',
    'void',
    'while',
    'with',
    'yield',

    // Future reserved keywords
    'implements',
    'interface',
    'package',
    'private',
    'protected',
    'public',
];

export const identifierRegex = /[$_\p{ID_Start}][$_\u200C\u200D\p{ID_Continue}]*/u;

const exactRegex = new RegExp(`^${identifierRegex.source}$`, identifierRegex.flags);

export function isReserved(value: string): boolean {
    return reservedIdentifiers.includes(value);
}

export function isIdentifier(value: string): boolean {
    return exactRegex.test(value) && !isReserved(value);
}
