import {identifierRegex, isIdentifier, isReserved, reservedIdentifiers} from '../src';

describe('identifier', () => {
    const validIdentifiers = [
        'validIdentifier',
        'camelCase',
        'snake_case',
        'PascalCase',
        '_leadingUnderscore',
        '$dollarSign',
        'with123Numbers',
        '\u00FC\u00F1\u00EE\u00E7\u00F8\u00F0\u00EA', // Unicode: üñîçødê
        '\uD835\uDC9C\uD835\uDCB7\uD835\uDCB8', // Unicode: 𝒜𝒷𝒸 (Mathematical script letters)
        'a\u200Db', // Contains Zero Width Joiner (ZWJ)
        'a\u200Cb', // Contains Zero Width Non-Joiner (ZWNJ)
    ];

    const invalidIdentifiers = [
        '123invalid',
        '-dashStart',
        'with space',
        'break-time',
        '@symbol',
        'var-name',
    ];

    const invalidAndReservedIdentifiers = [...reservedIdentifiers, ...invalidIdentifiers];

    describe('identifierRegex', () => {
        const regex = new RegExp(`^${identifierRegex.source}$`, identifierRegex.flags);

        it.each(validIdentifiers)('should match "%s"', identifier => {
            expect(identifier).toMatch(regex);
        });

        it.each(invalidIdentifiers)('should not match "%s"', identifier => {
            expect(identifier).not.toMatch(regex);
        });
    });

    describe('isIdentifier', () => {
        it.each(validIdentifiers)('should return true for "%s"', identifier => {
            expect(isIdentifier(identifier)).toBe(true);
        });

        it.each(invalidAndReservedIdentifiers)('should return false for "%s"', identifier => {
            expect(isIdentifier(identifier)).toBe(false);
        });
    });

    describe('isReserved', () => {
        it.each(reservedIdentifiers)('should return true for "%s"', identifier => {
            expect(isReserved(identifier)).toBe(true);
        });

        it.each(validIdentifiers)('should return false for "%s"', identifier => {
            expect(isReserved(identifier)).toBe(false);
        });
    });
});
