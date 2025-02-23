import {JsonLexer, JsonToken, JsonTokenType, SourcePosition} from '../src';
import 'jest-extended';
import {JsonParseError} from '../src/error';

describe('JsonLexer', () => {
    type Scenario = {
        input: string,
        tokens: JsonToken[],
    };

    const whitespace = [
        '\r', // Carriage return
        '\t', // Horizontal tab
        '\v', // Vertical tab
        '\f', // Form feed
        '\u00A0', // Non-breaking space
        '\u2028', // Line separator
        '\u2029', // Paragraph separator
        '\uFEFF', // Byte Order Mark (BOM)
        '\u1680', // Ogham space mark
        '\u2000', // En quad
        '\u2001', // Em quad
        '\u2002', // En space
        '\u2003', // Em space
        '\u2004', // Three-per-em space
        '\u2005', // Four-per-em space
        '\u2006', // Six-per-em space
        '\u2007', // Figure space
        '\u2008', // Punctuation space
        '\u2009', // Thin space
        '\u200A', // Hair space
        '\u202F', // Narrow no-break space
        '\u205F', // Medium mathematical space
        '\u3000', // Ideographic space
    ].join('');

    const numberKeywords = [
        'Infinity',
        'NaN',
    ];

    const reservedKeywords = [
        'true',
        'false',
        'null',
        ...numberKeywords,
    ];

    it.each<Scenario>([
        ...reservedKeywords
            .flatMap(keyword => [keyword.toUpperCase(), ...['$', '_', 'X'].map(suffix => keyword + suffix)])
            .map(
                keyword => [
                    {
                        input: keyword,
                        tokens: [
                            {
                                type: JsonTokenType.IDENTIFIER,
                                value: keyword,
                                location: {
                                    start: {
                                        index: 0,
                                        line: 1,
                                        column: 1,
                                    },
                                    end: {
                                        index: keyword.length,
                                        line: 1,
                                        column: keyword.length + 1,
                                    },
                                },
                            },
                            {
                                type: JsonTokenType.EOF,
                                value: '',
                                location: {
                                    start: {
                                        index: keyword.length,
                                        line: 1,
                                        column: keyword.length + 1,
                                    },
                                    end: {
                                        index: keyword.length,
                                        line: 1,
                                        column: keyword.length + 1,
                                    },
                                },
                            },
                        ],
                    },
                ],
            )
            .flat(),
        {
            input: '\r    {}\r\n    ',
            tokens: [
                {
                    type: JsonTokenType.WHITESPACE,
                    value: '\r    ',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                    },
                },
                {
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                    location: {
                        start: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                        end: {
                            index: 6,
                            line: 1,
                            column: 7,
                        },
                    },
                },
                {
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                    location: {
                        start: {
                            index: 6,
                            line: 1,
                            column: 7,
                        },
                        end: {
                            index: 7,
                            line: 1,
                            column: 8,
                        },
                    },
                },
                {
                    type: JsonTokenType.NEWLINE,
                    value: '\r\n',
                    location: {
                        start: {
                            index: 7,
                            line: 1,
                            column: 8,
                        },
                        end: {
                            index: 9,
                            line: 2,
                            column: 1,
                        },
                    },
                },
                {
                    type: JsonTokenType.WHITESPACE,
                    value: '    ',
                    location: {
                        start: {
                            index: 9,
                            line: 2,
                            column: 1,
                        },
                        end: {
                            index: 13,
                            line: 2,
                            column: 5,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 13,
                            line: 2,
                            column: 5,
                        },
                        end: {
                            index: 13,
                            line: 2,
                            column: 5,
                        },
                    },
                },
            ],
        },
        {
            input: 'true',
            tokens: [
                {
                    type: JsonTokenType.BOOLEAN,
                    value: 'true',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 4,
                            line: 1,
                            column: 5,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 4,
                            line: 1,
                            column: 5,
                        },
                        end: {
                            index: 4,
                            line: 1,
                            column: 5,
                        },
                    },
                },
            ],
        },
        {
            input: 'false',
            tokens: [
                {
                    type: JsonTokenType.BOOLEAN,
                    value: 'false',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                        end: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                    },
                },
            ],
        },
        {
            input: 'null',
            tokens: [
                {
                    type: JsonTokenType.NULL,
                    value: 'null',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 4,
                            line: 1,
                            column: 5,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 4,
                            line: 1,
                            column: 5,
                        },
                        end: {
                            index: 4,
                            line: 1,
                            column: 5,
                        },
                    },
                },
            ],
        },
        {
            input: '42',
            tokens: [
                {
                    type: JsonTokenType.NUMBER,
                    value: '42',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 2,
                            line: 1,
                            column: 3,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 2,
                            line: 1,
                            column: 3,
                        },
                        end: {
                            index: 2,
                            line: 1,
                            column: 3,
                        },
                    },
                },
            ],
        },
        {
            input: '+42',
            tokens: [
                {
                    type: JsonTokenType.NUMBER,
                    value: '+42',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 3,
                            line: 1,
                            column: 4,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 3,
                            line: 1,
                            column: 4,
                        },
                        end: {
                            index: 3,
                            line: 1,
                            column: 4,
                        },
                    },
                },
            ],
        },
        {
            input: '-42',
            tokens: [
                {
                    type: JsonTokenType.NUMBER,
                    value: '-42',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 3,
                            line: 1,
                            column: 4,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 3,
                            line: 1,
                            column: 4,
                        },
                        end: {
                            index: 3,
                            line: 1,
                            column: 4,
                        },
                    },
                },
            ],
        },
        {
            input: '42.3',
            tokens: [
                {
                    type: JsonTokenType.NUMBER,
                    value: '42.3',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 4,
                            line: 1,
                            column: 5,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 4,
                            line: 1,
                            column: 5,
                        },
                        end: {
                            index: 4,
                            line: 1,
                            column: 5,
                        },
                    },
                },
            ],
        },
        {
            input: '-42.3',
            tokens: [
                {
                    type: JsonTokenType.NUMBER,
                    value: '-42.3',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                        end: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                    },
                },
            ],
        },
        {
            input: '42e3',
            tokens: [
                {
                    type: JsonTokenType.NUMBER,
                    value: '42e3',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 4,
                            line: 1,
                            column: 5,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 4,
                            line: 1,
                            column: 5,
                        },
                        end: {
                            index: 4,
                            line: 1,
                            column: 5,
                        },
                    },
                },
            ],
        },
        {
            input: '42e+3',
            tokens: [
                {
                    type: JsonTokenType.NUMBER,
                    value: '42e+3',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                        end: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                    },
                },
            ],
        },
        {
            input: '42e-3',
            tokens: [
                {
                    type: JsonTokenType.NUMBER,
                    value: '42e-3',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                        end: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                    },
                },
            ],
        },
        {
            input: '42.3e3',
            tokens: [
                {
                    type: JsonTokenType.NUMBER,
                    value: '42.3e3',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 6,
                            line: 1,
                            column: 7,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 6,
                            line: 1,
                            column: 7,
                        },
                        end: {
                            index: 6,
                            line: 1,
                            column: 7,
                        },
                    },
                },
            ],
        },
        {
            input: '42.3e+3',
            tokens: [
                {
                    type: JsonTokenType.NUMBER,
                    value: '42.3e+3',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 7,
                            line: 1,
                            column: 8,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 7,
                            line: 1,
                            column: 8,
                        },
                        end: {
                            index: 7,
                            line: 1,
                            column: 8,
                        },
                    },
                },
            ],
        },
        {
            input: '42.3e-3',
            tokens: [
                {
                    type: JsonTokenType.NUMBER,
                    value: '42.3e-3',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 7,
                            line: 1,
                            column: 8,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 7,
                            line: 1,
                            column: 8,
                        },
                        end: {
                            index: 7,
                            line: 1,
                            column: 8,
                        },
                    },
                },
            ],
        },
        {
            input: '-42e3',
            tokens: [
                {
                    type: JsonTokenType.NUMBER,
                    value: '-42e3',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                        end: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                    },
                },
            ],
        },
        {
            input: '-42e+3',
            tokens: [
                {
                    type: JsonTokenType.NUMBER,
                    value: '-42e+3',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 6,
                            line: 1,
                            column: 7,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 6,
                            line: 1,
                            column: 7,
                        },
                        end: {
                            index: 6,
                            line: 1,
                            column: 7,
                        },
                    },
                },
            ],
        },
        {
            input: '-42e-3',
            tokens: [
                {
                    type: JsonTokenType.NUMBER,
                    value: '-42e-3',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 6,
                            line: 1,
                            column: 7,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 6,
                            line: 1,
                            column: 7,
                        },
                        end: {
                            index: 6,
                            line: 1,
                            column: 7,
                        },
                    },
                },
            ],
        },
        {
            input: '-42.3e3',
            tokens: [
                {
                    type: JsonTokenType.NUMBER,
                    value: '-42.3e3',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 7,
                            line: 1,
                            column: 8,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 7,
                            line: 1,
                            column: 8,
                        },
                        end: {
                            index: 7,
                            line: 1,
                            column: 8,
                        },
                    },
                },
            ],
        },
        {
            input: '-42.3e+3',
            tokens: [
                {
                    type: JsonTokenType.NUMBER,
                    value: '-42.3e+3',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 8,
                            line: 1,
                            column: 9,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 8,
                            line: 1,
                            column: 9,
                        },
                        end: {
                            index: 8,
                            line: 1,
                            column: 9,
                        },
                    },
                },
            ],
        },
        {
            input: '42.3e-3',
            tokens: [
                {
                    type: JsonTokenType.NUMBER,
                    value: '42.3e-3',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 7,
                            line: 1,
                            column: 8,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 7,
                            line: 1,
                            column: 8,
                        },
                        end: {
                            index: 7,
                            line: 1,
                            column: 8,
                        },
                    },
                },
            ],
        },
        {
            input: '.124',
            tokens: [
                {
                    type: JsonTokenType.NUMBER,
                    value: '.124',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 4,
                            line: 1,
                            column: 5,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 4,
                            line: 1,
                            column: 5,
                        },
                        end: {
                            index: 4,
                            line: 1,
                            column: 5,
                        },
                    },
                },
            ],
        },
        {
            input: '+.124',
            tokens: [
                {
                    type: JsonTokenType.NUMBER,
                    value: '+.124',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                        end: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                    },
                },
            ],
        },
        {
            input: '-.124',
            tokens: [
                {
                    type: JsonTokenType.NUMBER,
                    value: '-.124',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                        end: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                    },
                },
            ],
        },
        {
            input: '123.',
            tokens: [
                {
                    type: JsonTokenType.NUMBER,
                    value: '123.',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 4,
                            line: 1,
                            column: 5,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 4,
                            line: 1,
                            column: 5,
                        },
                        end: {
                            index: 4,
                            line: 1,
                            column: 5,
                        },
                    },
                },
            ],
        },
        {
            input: '+123.',
            tokens: [
                {
                    type: JsonTokenType.NUMBER,
                    value: '+123.',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                        end: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                    },
                },
            ],
        },
        {
            input: '-123.',
            tokens: [
                {
                    type: JsonTokenType.NUMBER,
                    value: '-123.',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                        end: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                    },
                },
            ],
        },
        {
            input: '0x2A',
            tokens: [
                {
                    type: JsonTokenType.NUMBER,
                    value: '0x2A',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 4,
                            line: 1,
                            column: 5,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 4,
                            line: 1,
                            column: 5,
                        },
                        end: {
                            index: 4,
                            line: 1,
                            column: 5,
                        },
                    },
                },
            ],
        },
        {
            input: '0X2A',
            tokens: [
                {
                    type: JsonTokenType.NUMBER,
                    value: '0X2A',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 4,
                            line: 1,
                            column: 5,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 4,
                            line: 1,
                            column: 5,
                        },
                        end: {
                            index: 4,
                            line: 1,
                            column: 5,
                        },
                    },
                },
            ],
        },
        {
            input: '-0x2A',
            tokens: [
                {
                    type: JsonTokenType.NUMBER,
                    value: '-0x2A',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                        end: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                    },
                },
            ],
        },
        {
            input: '-0X2A',
            tokens: [
                {
                    type: JsonTokenType.NUMBER,
                    value: '-0X2A',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                        end: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                    },
                },
            ],
        },
        {
            input: '+0x2A',
            tokens: [
                {
                    type: JsonTokenType.NUMBER,
                    value: '+0x2A',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                        end: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                    },
                },
            ],
        },
        {
            input: '+0X2A',
            tokens: [
                {
                    type: JsonTokenType.NUMBER,
                    value: '+0X2A',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                        end: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                    },
                },
            ],
        },
        ...numberKeywords
            .flatMap(number => [number, ...['+', '-'].map(signal => signal + number)])
            .map(
                number => [
                    {
                        input: number,
                        tokens: [
                            {
                                type: JsonTokenType.NUMBER,
                                value: number,
                                location: {
                                    start: {
                                        index: 0,
                                        line: 1,
                                        column: 1,
                                    },
                                    end: {
                                        index: number.length,
                                        line: 1,
                                        column: number.length + 1,
                                    },
                                },
                            },
                            {
                                type: JsonTokenType.EOF,
                                value: '',
                                location: {
                                    start: {
                                        index: number.length,
                                        line: 1,
                                        column: number.length + 1,
                                    },
                                    end: {
                                        index: number.length,
                                        line: 1,
                                        column: number.length + 1,
                                    },
                                },
                            },
                        ],
                    },
                ],
            )
            .flat(),
        {
            input: '"value"',
            tokens: [
                {
                    type: JsonTokenType.STRING,
                    value: '"value"',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 7,
                            line: 1,
                            column: 8,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 7,
                            line: 1,
                            column: 8,
                        },
                        end: {
                            index: 7,
                            line: 1,
                            column: 8,
                        },
                    },
                },
            ],
        },
        {
            input: '"\\\\value\\""',
            tokens: [
                {
                    type: JsonTokenType.STRING,
                    value: '"\\\\value\\""',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 11,
                            line: 1,
                            column: 12,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 11,
                            line: 1,
                            column: 12,
                        },
                        end: {
                            index: 11,
                            line: 1,
                            column: 12,
                        },
                    },
                },
            ],
        },
        {
            input: '{}',
            tokens: [
                {
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 1,
                            line: 1,
                            column: 2,
                        },
                    },
                },
                {
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                    location: {
                        start: {
                            index: 1,
                            line: 1,
                            column: 2,
                        },
                        end: {
                            index: 2,
                            line: 1,
                            column: 3,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 2,
                            line: 1,
                            column: 3,
                        },
                        end: {
                            index: 2,
                            line: 1,
                            column: 3,
                        },
                    },
                },
            ],
        },
        {
            input: '{"key": "value"}',
            tokens: [
                {
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 1,
                            line: 1,
                            column: 2,
                        },
                    },
                },
                {
                    type: JsonTokenType.STRING,
                    value: '"key"',
                    location: {
                        start: {
                            index: 1,
                            line: 1,
                            column: 2,
                        },
                        end: {
                            index: 6,
                            line: 1,
                            column: 7,
                        },
                    },
                },
                {
                    type: JsonTokenType.COLON,
                    value: ':',
                    location: {
                        start: {
                            index: 6,
                            line: 1,
                            column: 7,
                        },
                        end: {
                            index: 7,
                            line: 1,
                            column: 8,
                        },
                    },
                },
                {
                    type: JsonTokenType.WHITESPACE,
                    value: ' ',
                    location: {
                        start: {
                            index: 7,
                            line: 1,
                            column: 8,
                        },
                        end: {
                            index: 8,
                            line: 1,
                            column: 9,
                        },
                    },
                },
                {
                    type: JsonTokenType.STRING,
                    value: '"value"',
                    location: {
                        start: {
                            index: 8,
                            line: 1,
                            column: 9,
                        },
                        end: {
                            index: 15,
                            line: 1,
                            column: 16,
                        },
                    },
                },
                {
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                    location: {
                        start: {
                            index: 15,
                            line: 1,
                            column: 16,
                        },
                        end: {
                            index: 16,
                            line: 1,
                            column: 17,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 16,
                            line: 1,
                            column: 17,
                        },
                        end: {
                            index: 16,
                            line: 1,
                            column: 17,
                        },
                    },
                },
            ],
        },
        {
            input: '{"\\"key": "value"}',
            tokens: [
                {
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 1,
                            line: 1,
                            column: 2,
                        },
                    },
                },
                {
                    type: JsonTokenType.STRING,
                    value: '"\\"key"',
                    location: {
                        start: {
                            index: 1,
                            line: 1,
                            column: 2,
                        },
                        end: {
                            index: 8,
                            line: 1,
                            column: 9,
                        },
                    },
                },
                {
                    type: JsonTokenType.COLON,
                    value: ':',
                    location: {
                        start: {
                            index: 8,
                            line: 1,
                            column: 9,
                        },
                        end: {
                            index: 9,
                            line: 1,
                            column: 10,
                        },
                    },
                },
                {
                    type: JsonTokenType.WHITESPACE,
                    value: ' ',
                    location: {
                        start: {
                            index: 9,
                            line: 1,
                            column: 10,
                        },
                        end: {
                            index: 10,
                            line: 1,
                            column: 11,
                        },
                    },
                },
                {
                    type: JsonTokenType.STRING,
                    value: '"value"',
                    location: {
                        start: {
                            index: 10,
                            line: 1,
                            column: 11,
                        },
                        end: {
                            index: 17,
                            line: 1,
                            column: 18,
                        },
                    },
                },
                {
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                    location: {
                        start: {
                            index: 17,
                            line: 1,
                            column: 18,
                        },
                        end: {
                            index: 18,
                            line: 1,
                            column: 19,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 18,
                            line: 1,
                            column: 19,
                        },
                        end: {
                            index: 18,
                            line: 1,
                            column: 19,
                        },
                    },
                },
            ],
        },
        {
            input: '{foo: \'bar\'}',
            tokens: [
                {
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 1,
                            line: 1,
                            column: 2,
                        },
                    },
                },
                {
                    type: JsonTokenType.IDENTIFIER,
                    value: 'foo',
                    location: {
                        start: {
                            index: 1,
                            line: 1,
                            column: 2,
                        },
                        end: {
                            index: 4,
                            line: 1,
                            column: 5,
                        },
                    },
                },
                {
                    type: JsonTokenType.COLON,
                    value: ':',
                    location: {
                        start: {
                            index: 4,
                            line: 1,
                            column: 5,
                        },
                        end: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                    },
                },
                {
                    type: JsonTokenType.WHITESPACE,
                    value: ' ',
                    location: {
                        start: {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                        end: {
                            index: 6,
                            line: 1,
                            column: 7,
                        },
                    },
                },
                {
                    type: JsonTokenType.STRING,
                    value: "'bar'",
                    location: {
                        start: {
                            index: 6,
                            line: 1,
                            column: 7,
                        },
                        end: {
                            index: 11,
                            line: 1,
                            column: 12,
                        },
                    },
                },
                {
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                    location: {
                        start: {
                            index: 11,
                            line: 1,
                            column: 12,
                        },
                        end: {
                            index: 12,
                            line: 1,
                            column: 13,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 12,
                            line: 1,
                            column: 13,
                        },
                        end: {
                            index: 12,
                            line: 1,
                            column: 13,
                        },
                    },
                },
            ],
        },
        {
            input: '"first\\\nsecond\\\r\nthird"',
            tokens: [
                {
                    type: JsonTokenType.STRING,
                    value: '"first\\\nsecond\\\r\nthird"',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 23,
                            line: 3,
                            column: 7,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 23,
                            line: 3,
                            column: 7,
                        },
                        end: {
                            index: 23,
                            line: 3,
                            column: 7,
                        },
                    },
                },
            ],
        },
        {
            input: "'first\\\nsecond\\\r\nthird'",
            tokens: [
                {
                    type: JsonTokenType.STRING,
                    value: "'first\\\nsecond\\\r\nthird'",
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 23,
                            line: 3,
                            column: 7,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 23,
                            line: 3,
                            column: 7,
                        },
                        end: {
                            index: 23,
                            line: 3,
                            column: 7,
                        },
                    },
                },
            ],
        },
        {
            input: "'first\\\u2028second\\\r\nthird'",
            tokens: [
                {
                    type: JsonTokenType.STRING,
                    value: "'first\\\u2028second\\\r\nthird'",
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 23,
                            line: 2,
                            column: 7,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 23,
                            line: 2,
                            column: 7,
                        },
                        end: {
                            index: 23,
                            line: 2,
                            column: 7,
                        },
                    },
                },
            ],
        },
        {
            input: "'first\\\u2029second\\\r\nthird'",
            tokens: [
                {
                    type: JsonTokenType.STRING,
                    value: "'first\\\u2029second\\\r\nthird'",
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 23,
                            line: 2,
                            column: 7,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 23,
                            line: 2,
                            column: 7,
                        },
                        end: {
                            index: 23,
                            line: 2,
                            column: 7,
                        },
                    },
                },
            ],
        },
        {
            input: "'\uD83C\uDFBC'",
            tokens: [
                {
                    type: JsonTokenType.STRING,
                    value: "'\uD83C\uDFBC'",
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 3,
                            line: 1,
                            column: 4,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 3,
                            line: 1,
                            column: 4,
                        },
                        end: {
                            index: 3,
                            line: 1,
                            column: 4,
                        },
                    },
                },
            ],
        },
        {
            input: "'🤯'",
            tokens: [
                {
                    type: JsonTokenType.STRING,
                    value: "'🤯'",
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 3,
                            line: 1,
                            column: 4,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 3,
                            line: 1,
                            column: 4,
                        },
                        end: {
                            index: 3,
                            line: 1,
                            column: 4,
                        },
                    },
                },
            ],
        },
        {
            input: '{\n}',
            tokens: [
                {
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 1,
                            line: 1,
                            column: 2,
                        },
                    },
                },
                {
                    type: JsonTokenType.NEWLINE,
                    value: '\n',
                    location: {
                        start: {
                            index: 1,
                            line: 1,
                            column: 2,
                        },
                        end: {
                            index: 2,
                            line: 2,
                            column: 1,
                        },
                    },
                },
                {
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                    location: {
                        start: {
                            index: 2,
                            line: 2,
                            column: 1,
                        },
                        end: {
                            index: 3,
                            line: 2,
                            column: 2,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 3,
                            line: 2,
                            column: 2,
                        },
                        end: {
                            index: 3,
                            line: 2,
                            column: 2,
                        },
                    },
                },
            ],
        },
        {
            input: '{\r\n}',
            tokens: [
                {
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 1,
                            line: 1,
                            column: 2,
                        },
                    },
                },
                {
                    type: JsonTokenType.NEWLINE,
                    value: '\r\n',
                    location: {
                        start: {
                            index: 1,
                            line: 1,
                            column: 2,
                        },
                        end: {
                            index: 3,
                            line: 2,
                            column: 1,
                        },
                    },
                },
                {
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                    location: {
                        start: {
                            index: 3,
                            line: 2,
                            column: 1,
                        },
                        end: {
                            index: 4,
                            line: 2,
                            column: 2,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 4,
                            line: 2,
                            column: 2,
                        },
                        end: {
                            index: 4,
                            line: 2,
                            column: 2,
                        },
                    },
                },
            ],
        },
        {
            input: '[]',
            tokens: [
                {
                    type: JsonTokenType.BRACKET_LEFT,
                    value: '[',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 1,
                            line: 1,
                            column: 2,
                        },
                    },
                },
                {
                    type: JsonTokenType.BRACKET_RIGHT,
                    value: ']',
                    location: {
                        start: {
                            index: 1,
                            line: 1,
                            column: 2,
                        },
                        end: {
                            index: 2,
                            line: 1,
                            column: 3,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 2,
                            line: 1,
                            column: 3,
                        },
                        end: {
                            index: 2,
                            line: 1,
                            column: 3,
                        },
                    },
                },
            ],
        },
        {
            input: JSON.stringify(
                {
                    string: 'value',
                    number: 42,
                    boolean: true,
                    null: null,
                    object: {
                        key: 'value',
                    },
                    array: [
                        'value',
                    ],
                },
                null,
                2,
            ),
            tokens: [
                {
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 1,
                            line: 1,
                            column: 2,
                        },
                    },
                },
                {
                    type: JsonTokenType.NEWLINE,
                    value: '\n',
                    location: {
                        start: {
                            index: 1,
                            line: 1,
                            column: 2,
                        },
                        end: {
                            index: 2,
                            line: 2,
                            column: 1,
                        },
                    },
                },
                {
                    type: JsonTokenType.WHITESPACE,
                    value: '  ',
                    location: {
                        start: {
                            index: 2,
                            line: 2,
                            column: 1,
                        },
                        end: {
                            index: 4,
                            line: 2,
                            column: 3,
                        },
                    },
                },
                {
                    type: JsonTokenType.STRING,
                    value: '"string"',
                    location: {
                        start: {
                            index: 4,
                            line: 2,
                            column: 3,
                        },
                        end: {
                            index: 12,
                            line: 2,
                            column: 11,
                        },
                    },
                },
                {
                    type: JsonTokenType.COLON,
                    value: ':',
                    location: {
                        start: {
                            index: 12,
                            line: 2,
                            column: 11,
                        },
                        end: {
                            index: 13,
                            line: 2,
                            column: 12,
                        },
                    },
                },
                {
                    type: JsonTokenType.WHITESPACE,
                    value: ' ',
                    location: {
                        start: {
                            index: 13,
                            line: 2,
                            column: 12,
                        },
                        end: {
                            index: 14,
                            line: 2,
                            column: 13,
                        },
                    },
                },
                {
                    type: JsonTokenType.STRING,
                    value: '"value"',
                    location: {
                        start: {
                            index: 14,
                            line: 2,
                            column: 13,
                        },
                        end: {
                            index: 21,
                            line: 2,
                            column: 20,
                        },
                    },
                },
                {
                    type: JsonTokenType.COMMA,
                    value: ',',
                    location: {
                        start: {
                            index: 21,
                            line: 2,
                            column: 20,
                        },
                        end: {
                            index: 22,
                            line: 2,
                            column: 21,
                        },
                    },
                },
                {
                    type: JsonTokenType.NEWLINE,
                    value: '\n',
                    location: {
                        start: {
                            index: 22,
                            line: 2,
                            column: 21,
                        },
                        end: {
                            index: 23,
                            line: 3,
                            column: 1,
                        },
                    },
                },
                {
                    type: JsonTokenType.WHITESPACE,
                    value: '  ',
                    location: {
                        start: {
                            index: 23,
                            line: 3,
                            column: 1,
                        },
                        end: {
                            index: 25,
                            line: 3,
                            column: 3,
                        },
                    },
                },
                {
                    type: JsonTokenType.STRING,
                    value: '"number"',
                    location: {
                        start: {
                            index: 25,
                            line: 3,
                            column: 3,
                        },
                        end: {
                            index: 33,
                            line: 3,
                            column: 11,
                        },
                    },
                },
                {
                    type: JsonTokenType.COLON,
                    value: ':',
                    location: {
                        start: {
                            index: 33,
                            line: 3,
                            column: 11,
                        },
                        end: {
                            index: 34,
                            line: 3,
                            column: 12,
                        },
                    },
                },
                {
                    type: JsonTokenType.WHITESPACE,
                    value: ' ',
                    location: {
                        start: {
                            index: 34,
                            line: 3,
                            column: 12,
                        },
                        end: {
                            index: 35,
                            line: 3,
                            column: 13,
                        },
                    },
                },
                {
                    type: JsonTokenType.NUMBER,
                    value: '42',
                    location: {
                        start: {
                            index: 35,
                            line: 3,
                            column: 13,
                        },
                        end: {
                            index: 37,
                            line: 3,
                            column: 15,
                        },
                    },
                },
                {
                    type: JsonTokenType.COMMA,
                    value: ',',
                    location: {
                        start: {
                            index: 37,
                            line: 3,
                            column: 15,
                        },
                        end: {
                            index: 38,
                            line: 3,
                            column: 16,
                        },
                    },
                },
                {
                    type: JsonTokenType.NEWLINE,
                    value: '\n',
                    location: {
                        start: {
                            index: 38,
                            line: 3,
                            column: 16,
                        },
                        end: {
                            index: 39,
                            line: 4,
                            column: 1,
                        },
                    },
                },
                {
                    type: JsonTokenType.WHITESPACE,
                    value: '  ',
                    location: {
                        start: {
                            index: 39,
                            line: 4,
                            column: 1,
                        },
                        end: {
                            index: 41,
                            line: 4,
                            column: 3,
                        },
                    },
                },
                {
                    type: JsonTokenType.STRING,
                    value: '"boolean"',
                    location: {
                        start: {
                            index: 41,
                            line: 4,
                            column: 3,
                        },
                        end: {
                            index: 50,
                            line: 4,
                            column: 12,
                        },
                    },
                },
                {
                    type: JsonTokenType.COLON,
                    value: ':',
                    location: {
                        start: {
                            index: 50,
                            line: 4,
                            column: 12,
                        },
                        end: {
                            index: 51,
                            line: 4,
                            column: 13,
                        },
                    },
                },
                {
                    type: JsonTokenType.WHITESPACE,
                    value: ' ',
                    location: {
                        start: {
                            index: 51,
                            line: 4,
                            column: 13,
                        },
                        end: {
                            index: 52,
                            line: 4,
                            column: 14,
                        },
                    },
                },
                {
                    type: JsonTokenType.BOOLEAN,
                    value: 'true',
                    location: {
                        start: {
                            index: 52,
                            line: 4,
                            column: 14,
                        },
                        end: {
                            index: 56,
                            line: 4,
                            column: 18,
                        },
                    },
                },
                {
                    type: JsonTokenType.COMMA,
                    value: ',',
                    location: {
                        start: {
                            index: 56,
                            line: 4,
                            column: 18,
                        },
                        end: {
                            index: 57,
                            line: 4,
                            column: 19,
                        },
                    },
                },
                {
                    type: JsonTokenType.NEWLINE,
                    value: '\n',
                    location: {
                        start: {
                            index: 57,
                            line: 4,
                            column: 19,
                        },
                        end: {
                            index: 58,
                            line: 5,
                            column: 1,
                        },
                    },
                },
                {
                    type: JsonTokenType.WHITESPACE,
                    value: '  ',
                    location: {
                        start: {
                            index: 58,
                            line: 5,
                            column: 1,
                        },
                        end: {
                            index: 60,
                            line: 5,
                            column: 3,
                        },
                    },
                },
                {
                    type: JsonTokenType.STRING,
                    value: '"null"',
                    location: {
                        start: {
                            index: 60,
                            line: 5,
                            column: 3,
                        },
                        end: {
                            index: 66,
                            line: 5,
                            column: 9,
                        },
                    },
                },
                {
                    type: JsonTokenType.COLON,
                    value: ':',
                    location: {
                        start: {
                            index: 66,
                            line: 5,
                            column: 9,
                        },
                        end: {
                            index: 67,
                            line: 5,
                            column: 10,
                        },
                    },
                },
                {
                    type: JsonTokenType.WHITESPACE,
                    value: ' ',
                    location: {
                        start: {
                            index: 67,
                            line: 5,
                            column: 10,
                        },
                        end: {
                            index: 68,
                            line: 5,
                            column: 11,
                        },
                    },
                },
                {
                    type: JsonTokenType.NULL,
                    value: 'null',
                    location: {
                        start: {
                            index: 68,
                            line: 5,
                            column: 11,
                        },
                        end: {
                            index: 72,
                            line: 5,
                            column: 15,
                        },
                    },
                },
                {
                    type: JsonTokenType.COMMA,
                    value: ',',
                    location: {
                        start: {
                            index: 72,
                            line: 5,
                            column: 15,
                        },
                        end: {
                            index: 73,
                            line: 5,
                            column: 16,
                        },
                    },
                },
                {
                    type: JsonTokenType.NEWLINE,
                    value: '\n',
                    location: {
                        start: {
                            index: 73,
                            line: 5,
                            column: 16,
                        },
                        end: {
                            index: 74,
                            line: 6,
                            column: 1,
                        },
                    },
                },
                {
                    type: JsonTokenType.WHITESPACE,
                    value: '  ',
                    location: {
                        start: {
                            index: 74,
                            line: 6,
                            column: 1,
                        },
                        end: {
                            index: 76,
                            line: 6,
                            column: 3,
                        },
                    },
                },
                {
                    type: JsonTokenType.STRING,
                    value: '"object"',
                    location: {
                        start: {
                            index: 76,
                            line: 6,
                            column: 3,
                        },
                        end: {
                            index: 84,
                            line: 6,
                            column: 11,
                        },
                    },
                },
                {
                    type: JsonTokenType.COLON,
                    value: ':',
                    location: {
                        start: {
                            index: 84,
                            line: 6,
                            column: 11,
                        },
                        end: {
                            index: 85,
                            line: 6,
                            column: 12,
                        },
                    },
                },
                {
                    type: JsonTokenType.WHITESPACE,
                    value: ' ',
                    location: {
                        start: {
                            index: 85,
                            line: 6,
                            column: 12,
                        },
                        end: {
                            index: 86,
                            line: 6,
                            column: 13,
                        },
                    },
                },
                {
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                    location: {
                        start: {
                            index: 86,
                            line: 6,
                            column: 13,
                        },
                        end: {
                            index: 87,
                            line: 6,
                            column: 14,
                        },
                    },
                },
                {
                    type: JsonTokenType.NEWLINE,
                    value: '\n',
                    location: {
                        start: {
                            index: 87,
                            line: 6,
                            column: 14,
                        },
                        end: {
                            index: 88,
                            line: 7,
                            column: 1,
                        },
                    },
                },
                {
                    type: JsonTokenType.WHITESPACE,
                    value: '    ',
                    location: {
                        start: {
                            index: 88,
                            line: 7,
                            column: 1,
                        },
                        end: {
                            index: 92,
                            line: 7,
                            column: 5,
                        },
                    },
                },
                {
                    type: JsonTokenType.STRING,
                    value: '"key"',
                    location: {
                        start: {
                            index: 92,
                            line: 7,
                            column: 5,
                        },
                        end: {
                            index: 97,
                            line: 7,
                            column: 10,
                        },
                    },
                },
                {
                    type: JsonTokenType.COLON,
                    value: ':',
                    location: {
                        start: {
                            index: 97,
                            line: 7,
                            column: 10,
                        },
                        end: {
                            index: 98,
                            line: 7,
                            column: 11,
                        },
                    },
                },
                {
                    type: JsonTokenType.WHITESPACE,
                    value: ' ',
                    location: {
                        start: {
                            index: 98,
                            line: 7,
                            column: 11,
                        },
                        end: {
                            index: 99,
                            line: 7,
                            column: 12,
                        },
                    },
                },
                {
                    type: JsonTokenType.STRING,
                    value: '"value"',
                    location: {
                        start: {
                            index: 99,
                            line: 7,
                            column: 12,
                        },
                        end: {
                            index: 106,
                            line: 7,
                            column: 19,
                        },
                    },
                },
                {
                    type: JsonTokenType.NEWLINE,
                    value: '\n',
                    location: {
                        start: {
                            index: 106,
                            line: 7,
                            column: 19,
                        },
                        end: {
                            index: 107,
                            line: 8,
                            column: 1,
                        },
                    },
                },
                {
                    type: JsonTokenType.WHITESPACE,
                    value: '  ',
                    location: {
                        start: {
                            index: 107,
                            line: 8,
                            column: 1,
                        },
                        end: {
                            index: 109,
                            line: 8,
                            column: 3,
                        },
                    },
                },
                {
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                    location: {
                        start: {
                            index: 109,
                            line: 8,
                            column: 3,
                        },
                        end: {
                            index: 110,
                            line: 8,
                            column: 4,
                        },
                    },
                },
                {
                    type: JsonTokenType.COMMA,
                    value: ',',
                    location: {
                        start: {
                            index: 110,
                            line: 8,
                            column: 4,
                        },
                        end: {
                            index: 111,
                            line: 8,
                            column: 5,
                        },
                    },
                },
                {
                    type: JsonTokenType.NEWLINE,
                    value: '\n',
                    location: {
                        start: {
                            index: 111,
                            line: 8,
                            column: 5,
                        },
                        end: {
                            index: 112,
                            line: 9,
                            column: 1,
                        },
                    },
                },
                {
                    type: JsonTokenType.WHITESPACE,
                    value: '  ',
                    location: {
                        start: {
                            index: 112,
                            line: 9,
                            column: 1,
                        },
                        end: {
                            index: 114,
                            line: 9,
                            column: 3,
                        },
                    },
                },
                {
                    type: JsonTokenType.STRING,
                    value: '"array"',
                    location: {
                        start: {
                            index: 114,
                            line: 9,
                            column: 3,
                        },
                        end: {
                            index: 121,
                            line: 9,
                            column: 10,
                        },
                    },
                },
                {
                    type: JsonTokenType.COLON,
                    value: ':',
                    location: {
                        start: {
                            index: 121,
                            line: 9,
                            column: 10,
                        },
                        end: {
                            index: 122,
                            line: 9,
                            column: 11,
                        },
                    },
                },
                {
                    type: JsonTokenType.WHITESPACE,
                    value: ' ',
                    location: {
                        start: {
                            index: 122,
                            line: 9,
                            column: 11,
                        },
                        end: {
                            index: 123,
                            line: 9,
                            column: 12,
                        },
                    },
                },
                {
                    type: JsonTokenType.BRACKET_LEFT,
                    value: '[',
                    location: {
                        start: {
                            index: 123,
                            line: 9,
                            column: 12,
                        },
                        end: {
                            index: 124,
                            line: 9,
                            column: 13,
                        },
                    },
                },
                {
                    type: JsonTokenType.NEWLINE,
                    value: '\n',
                    location: {
                        start: {
                            index: 124,
                            line: 9,
                            column: 13,
                        },
                        end: {
                            index: 125,
                            line: 10,
                            column: 1,
                        },
                    },
                },
                {
                    type: JsonTokenType.WHITESPACE,
                    value: '    ',
                    location: {
                        start: {
                            index: 125,
                            line: 10,
                            column: 1,
                        },
                        end: {
                            index: 129,
                            line: 10,
                            column: 5,
                        },
                    },
                },
                {
                    type: JsonTokenType.STRING,
                    value: '"value"',
                    location: {
                        start: {
                            index: 129,
                            line: 10,
                            column: 5,
                        },
                        end: {
                            index: 136,
                            line: 10,
                            column: 12,
                        },
                    },
                },
                {
                    type: JsonTokenType.NEWLINE,
                    value: '\n',
                    location: {
                        start: {
                            index: 136,
                            line: 10,
                            column: 12,
                        },
                        end: {
                            index: 137,
                            line: 11,
                            column: 1,
                        },
                    },
                },
                {
                    type: JsonTokenType.WHITESPACE,
                    value: '  ',
                    location: {
                        start: {
                            index: 137,
                            line: 11,
                            column: 1,
                        },
                        end: {
                            index: 139,
                            line: 11,
                            column: 3,
                        },
                    },
                },
                {
                    type: JsonTokenType.BRACKET_RIGHT,
                    value: ']',
                    location: {
                        start: {
                            index: 139,
                            line: 11,
                            column: 3,
                        },
                        end: {
                            index: 140,
                            line: 11,
                            column: 4,
                        },
                    },
                },
                {
                    type: JsonTokenType.NEWLINE,
                    value: '\n',
                    location: {
                        start: {
                            index: 140,
                            line: 11,
                            column: 4,
                        },
                        end: {
                            index: 141,
                            line: 12,
                            column: 1,
                        },
                    },
                },
                {
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                    location: {
                        start: {
                            index: 141,
                            line: 12,
                            column: 1,
                        },
                        end: {
                            index: 142,
                            line: 12,
                            column: 2,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 142,
                            line: 12,
                            column: 2,
                        },
                        end: {
                            index: 142,
                            line: 12,
                            column: 2,
                        },
                    },
                },
            ],
        },
        {
            input: '\n\n',
            tokens: [
                {
                    type: JsonTokenType.NEWLINE,
                    value: '\n',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 1,
                            line: 2,
                            column: 1,
                        },
                    },
                },
                {
                    type: JsonTokenType.NEWLINE,
                    value: '\n',
                    location: {
                        start: {
                            index: 1,
                            line: 2,
                            column: 1,
                        },
                        end: {
                            index: 2,
                            line: 3,
                            column: 1,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 2,
                            line: 3,
                            column: 1,
                        },
                        end: {
                            index: 2,
                            line: 3,
                            column: 1,
                        },
                    },
                },
            ],
        },
        {
            input: '// comment\n{}',
            tokens: [
                {
                    type: JsonTokenType.LINE_COMMENT,
                    value: '// comment',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 10,
                            line: 1,
                            column: 11,
                        },
                    },
                },
                {
                    type: JsonTokenType.NEWLINE,
                    value: '\n',
                    location: {
                        start: {
                            index: 10,
                            line: 1,
                            column: 11,
                        },
                        end: {
                            index: 11,
                            line: 2,
                            column: 1,
                        },
                    },
                },
                {
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                    location: {
                        start: {
                            index: 11,
                            line: 2,
                            column: 1,
                        },
                        end: {
                            index: 12,
                            line: 2,
                            column: 2,
                        },
                    },
                },
                {
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                    location: {
                        start: {
                            index: 12,
                            line: 2,
                            column: 2,
                        },
                        end: {
                            index: 13,
                            line: 2,
                            column: 3,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 13,
                            line: 2,
                            column: 3,
                        },
                        end: {
                            index: 13,
                            line: 2,
                            column: 3,
                        },
                    },
                },
            ],
        },
        {
            input: '/* comment */{}',
            tokens: [
                {
                    type: JsonTokenType.BLOCK_COMMENT,
                    value: '/* comment */',
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: 13,
                            line: 1,
                            column: 14,
                        },
                    },
                },
                {
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                    location: {
                        start: {
                            index: 13,
                            line: 1,
                            column: 14,
                        },
                        end: {
                            index: 14,
                            line: 1,
                            column: 15,
                        },
                    },
                },
                {
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                    location: {
                        start: {
                            index: 14,
                            line: 1,
                            column: 15,
                        },
                        end: {
                            index: 15,
                            line: 1,
                            column: 16,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: 15,
                            line: 1,
                            column: 16,
                        },
                        end: {
                            index: 15,
                            line: 1,
                            column: 16,
                        },
                    },
                },
            ],
        },
        {
            input: `${whitespace}true`,
            tokens: [
                {
                    type: JsonTokenType.WHITESPACE,
                    value: whitespace,
                    location: {
                        start: {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: {
                            index: [...whitespace].length,
                            line: 1,
                            column: [...whitespace].length + 1,
                        },
                    },
                },
                {
                    type: JsonTokenType.BOOLEAN,
                    value: 'true',
                    location: {
                        start: {
                            index: [...whitespace].length,
                            line: 1,
                            column: [...whitespace].length + 1,
                        },
                        end: {
                            index: [...whitespace].length + 4,
                            line: 1,
                            column: [...whitespace].length + 5,
                        },
                    },
                },
                {
                    type: JsonTokenType.EOF,
                    value: '',
                    location: {
                        start: {
                            index: [...whitespace].length + 4,
                            line: 1,
                            column: [...whitespace].length + 5,
                        },
                        end: {
                            index: [...whitespace].length + 4,
                            line: 1,
                            column: [...whitespace].length + 5,
                        },
                    },
                },
            ],
        },
    ])('should tokenize $input', ({input, tokens}) => {
        const result = JsonLexer.tokenize(input);

        for (const token of result) {
            const {location} = token;

            expect(getSliceByIndex(location.start, location.end, input)).toEqual(token.value);
            expect(getSliceByLineAndColum(location.start, location.end, input)).toEqual(token.value);
        }

        expect(result).toEqual(tokens);
    });

    it('should be iterable', () => {
        const lexer = new JsonLexer('true');

        expect([...lexer]).toEqual([
            {
                type: JsonTokenType.BOOLEAN,
                value: 'true',
                location: {
                    start: {
                        index: 0,
                        line: 1,
                        column: 1,
                    },
                    end: {
                        index: 4,
                        line: 1,
                        column: 5,
                    },
                },
            },
            {
                type: JsonTokenType.EOF,
                value: '',
                location: {
                    start: {
                        index: 4,
                        line: 1,
                        column: 5,
                    },
                    end: {
                        index: 4,
                        line: 1,
                        column: 5,
                    },
                },
            },
        ]);
    });

    it('should recognize EOF', () => {
        const lexer = new JsonLexer('');

        lexer.next();

        expect(lexer.isEof()).toBeTrue();

        expect(lexer.peek()).toEqual({
            type: JsonTokenType.EOF,
            value: '',
            location: {
                start: {
                    index: 0,
                    line: 1,
                    column: 1,
                },
                end: {
                    index: 0,
                    line: 1,
                    column: 1,
                },
            },
        });
    });

    it('should advance to the next token', () => {
        const lexer = new JsonLexer('true');

        expect(lexer.next().type).toBe(JsonTokenType.BOOLEAN);

        expect(lexer.next().type).toBe(JsonTokenType.EOF);
    });

    it('should fail to advance if the lexer is at the end of the input', () => {
        const lexer = new JsonLexer('');

        expect(lexer.next().type).toBe(JsonTokenType.EOF);

        expect(() => lexer.next()).toThrow('The end of the input has been reached.');
    });

    it('should throw error on unexpected token', () => {
        const lexer = new JsonLexer('@');

        let caughtError: unknown;

        try {
            lexer.next();
        } catch (error) {
            caughtError = error;
        }

        expect(caughtError).toEqual(
            new JsonParseError(
                "Unexpected token '@' at 1:1.",
                {
                    start: {
                        index: 0,
                        line: 1,
                        column: 1,
                    },
                    end: {
                        index: 1,
                        line: 1,
                        column: 2,
                    },
                },
            ),
        );
    });

    it('should skip insignificant tokens', () => {
        const input = `
            /* comment */
            // comment
            true
        `;

        const lexer = new JsonLexer(input);

        lexer.next();

        expect(lexer.peek().type).toBe(JsonTokenType.NEWLINE);

        lexer.skipInsignificant();

        expect(lexer.peek().type).toBe(JsonTokenType.BOOLEAN);
    });

    it('should skip all specified tokens', () => {
        const input = `
            /* comment */
            // comment
            true
        `;

        const lexer = new JsonLexer(input);

        lexer.next();

        expect(lexer.peek().type).toBe(JsonTokenType.NEWLINE);

        lexer.skip(JsonTokenType.NEWLINE, JsonTokenType.WHITESPACE);

        expect(lexer.peek().type).toBe(JsonTokenType.BLOCK_COMMENT);

        lexer.skip(
            JsonTokenType.BLOCK_COMMENT,
            JsonTokenType.LINE_COMMENT,
            JsonTokenType.WHITESPACE,
            JsonTokenType.NEWLINE,
        );

        expect(lexer.peek().type).toBe(JsonTokenType.BOOLEAN);
    });

    it('should report a mismatch if the given token type does not match the next token', () => {
        const lexer = new JsonLexer('');

        lexer.next();

        let caughtError: unknown;

        try {
            lexer.expect(JsonTokenType.BOOLEAN);
        } catch (error) {
            caughtError = error;
        }

        expect(caughtError).toEqual(
            new JsonParseError(
                `Expected ${JsonTokenType.BOOLEAN}, but got ${JsonTokenType.EOF} at 1:1.`,
                {
                    start: {
                        index: 0,
                        line: 1,
                        column: 1,
                    },
                    end: {
                        index: 0,
                        line: 1,
                        column: 1,
                    },
                },
            ),
        );
    });

    it('should report a mismatch if none of the given token types match the next token', () => {
        const lexer = new JsonLexer('');

        lexer.next();

        let caughtError: unknown;

        try {
            lexer.expect(JsonTokenType.BOOLEAN, JsonTokenType.NULL);
        } catch (error) {
            caughtError = error;
        }

        expect(caughtError).toEqual(
            new JsonParseError(
                `Expected either ${JsonTokenType.BOOLEAN} or ${JsonTokenType.NULL}, `
                + `but got ${JsonTokenType.EOF} at 1:1.`,
                {
                    start: {
                        index: 0,
                        line: 1,
                        column: 1,
                    },
                    end: {
                        index: 0,
                        line: 1,
                        column: 1,
                    },
                },
            ),
        );
    });

    it('should check if the next token matches specified type', () => {
        const lexer = new JsonLexer('true');

        lexer.next();

        expect(lexer.peek().type).toBe(JsonTokenType.BOOLEAN);

        lexer.expect(JsonTokenType.BOOLEAN);

        expect(lexer.peek().type).toBe(JsonTokenType.BOOLEAN);
    });

    it('should consume the next specified token', () => {
        const lexer = new JsonLexer(' true');

        const types = [JsonTokenType.BOOLEAN, JsonTokenType.WHITESPACE] as const;

        lexer.next();

        expect(lexer.consume(...types).type).toBe(JsonTokenType.WHITESPACE);
        expect(lexer.consume(...types).type).toBe(JsonTokenType.BOOLEAN);

        expect(lexer.isEof()).toBeTrue();
    });

    it('should report a mismatch if the given token type does not match the next specified token', () => {
        const lexer = new JsonLexer('');

        lexer.next();

        let caughtError: unknown;

        try {
            lexer.consume(JsonTokenType.BOOLEAN);
        } catch (error) {
            caughtError = error;
        }

        expect(caughtError).toEqual(
            new JsonParseError(
                `Expected ${JsonTokenType.BOOLEAN}, but got ${JsonTokenType.EOF} at 1:1.`,
                {
                    start: {
                        index: 0,
                        line: 1,
                        column: 1,
                    },
                    end: {
                        index: 0,
                        line: 1,
                        column: 1,
                    },
                },
            ),
        );
    });

    it('should check whether the next token matches any of the specified types', () => {
        const lexer = new JsonLexer('true');

        lexer.next();

        expect(lexer.matches()).toBeTrue();
        expect(lexer.matches(JsonTokenType.NULL)).toBeFalse();
        expect(lexer.matches(JsonTokenType.BOOLEAN)).toBeTrue();
    });

    it('should peek the next token', () => {
        const lexer = new JsonLexer('true');

        lexer.next();

        expect(lexer.peek().type).toBe(JsonTokenType.BOOLEAN);

        lexer.next();

        expect(lexer.peek().type).toBe(JsonTokenType.EOF);
    });

    it('should report an error peeking before initializing the lexer', () => {
        const lexer = new JsonLexer('');

        expect(() => lexer.peek()).toThrow('No token has been consumed yet');
    });

    function getSliceByIndex(start: SourcePosition, end: SourcePosition, input: string): string {
        return [...input].slice(start.index, end.index).join('');
    }

    function getSliceByLineAndColum(start: SourcePosition, end: SourcePosition, input: string): string {
        let startIndex = 0;
        let endIndex = 0;

        const chars = [...input];

        for (let index = 0, line = 1, column = 1; index <= chars.length; index++) {
            if (line === start.line && column === start.column) {
                startIndex = index;
            }

            if (line === end.line && column === end.column) {
                endIndex = index;

                break;
            }

            if (chars[index] === '\n') {
                line++;
                column = 1;
            } else {
                column++;
            }
        }

        return chars.slice(startIndex, endIndex).join('');
    }
});
