import {
    JsonArrayNode,
    JsonIdentifierNode,
    JsonObjectNode,
    JsonParser,
    JsonPrimitiveNode,
    JsonPropertyNode,
    JsonTokenNode,
    JsonTokenType,
} from '../src';
import {JsonParseError} from '../src/error';

describe('JsonParser', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should report an error if an unexpected token is encountered', () => {
        let caughtError: unknown;

        try {
            JsonParser.parse('!');
        } catch (error) {
            caughtError = error;
        }

        expect(caughtError).toEqual(
            new JsonParseError(
                'Unexpected token \'!\' at 1:1.',
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

    it('should report an error if the input is malformed', () => {
        let caughtError: unknown;

        try {
            JsonParser.parse('}');
        } catch (error) {
            caughtError = error;
        }

        expect(caughtError).toEqual(
            new JsonParseError(
                'Unexpected token \'}\' at 1:1.',
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

    it('should report an error if extraneous input is encountered at the end of the input', () => {
        let caughtError: unknown;

        try {
            JsonParser.parse('{}!');
        } catch (error) {
            caughtError = error;
        }

        expect(caughtError).toEqual(
            new JsonParseError(
                'Unexpected token \'!\' at 1:3.',
                {
                    start: {
                        index: 3,
                        line: 1,
                        column: 4,
                    },
                    end: {
                        index: 4,
                        line: 1,
                        column: 5,
                    },
                },
            ),
        );
    });

    it('should skip insignificant tokens in the beginning and end of the input', () => {
        const leadingSpace = new JsonTokenNode({
            type: JsonTokenType.WHITESPACE,
            value: ' ',
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
        });

        const leftBrace = new JsonTokenNode({
            type: JsonTokenType.BRACE_LEFT,
            value: '{',
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
        });

        const rightBrace = new JsonTokenNode({
            type: JsonTokenType.BRACE_RIGHT,
            value: '}',
            location: {
                start: {
                    index: 2,
                    line: 1,
                    column: 3,
                },
                end: {
                    index: 3,
                    line: 1,
                    column: 4,
                },
            },
        });

        const trailingSpace = new JsonTokenNode({
            type: JsonTokenType.WHITESPACE,
            value: ' ',
            location: {
                start: {
                    index: 3,
                    line: 1,
                    column: 4,
                },
                end: {
                    index: 4,
                    line: 1,
                    column: 5,
                },
            },
        });

        expect(JsonParser.parse(' {} ')).toEqual(new JsonObjectNode({
            properties: [],
            location: {
                start: leftBrace.location.start,
                end: rightBrace.location.end,
            },
            children: [leadingSpace, leftBrace, rightBrace, trailingSpace],
        }));
    });

    it('should parse a boolean token', () => {
        const token = new JsonTokenNode({
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
        });

        expect(JsonParser.parse('true')).toEqual(new JsonPrimitiveNode({
            value: true,
            token: token,
            location: token.location,
            children: [token],
        }));
    });

    it('should parse a null token', () => {
        const token = new JsonTokenNode({
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
        });

        expect(JsonParser.parse('null')).toEqual(new JsonPrimitiveNode({
            value: null,
            token: token,
            location: token.location,
            children: [token],
        }));
    });

    type NumberScenario = {
        input: string,
        expected: number,
    };

    it.each<NumberScenario>([
        {
            input: '42',
            expected: 42,
        },
        {
            input: '+42',
            expected: 42,
        },
        {
            input: '-42',
            expected: -42,
        },
        {
            input: 'Infinity',
            expected: Number.POSITIVE_INFINITY,
        },
        {
            input: '+Infinity',
            expected: Number.POSITIVE_INFINITY,
        },
        {
            input: '-Infinity',
            expected: Number.NEGATIVE_INFINITY,
        },
        {
            input: 'NaN',
            expected: Number.NaN,
        },
        {
            input: '+NaN',
            expected: Number.NaN,
        },
        {
            input: '-NaN',
            expected: Number.NaN,
        },
        {
            input: '.42',
            expected: 0.42,
        },
        {
            input: '+.42',
            expected: 0.42,
        },
        {
            input: '-.42',
            expected: -0.42,
        },
        {
            input: '42.',
            expected: 42,
        },
        {
            input: '+42.',
            expected: 42,
        },
        {
            input: '-42.',
            expected: -42,
        },
        {
            input: '42.0',
            expected: 42,
        },
        {
            input: '+42.0',
            expected: 42,
        },
        {
            input: '-42.0',
            expected: -42,
        },
        {
            input: '42.42',
            expected: 42.42,
        },
        {
            input: '+42.42',
            expected: 42.42,
        },
        {
            input: '-42.42',
            expected: -42.42,
        },
        {
            input: '0x2a',
            expected: 42,
        },
        {
            input: '+0x2a',
            expected: 42,
        },
        {
            input: '-0x2a',
            expected: -42,
        },
        {
            input: '0X2A',
            expected: 42,
        },
        {
            input: '+0X2A',
            expected: 42,
        },
        {
            input: '-0X2A',
            expected: -42,
        },
    ])('should parse number $input', ({input, expected}) => {
        const token = new JsonTokenNode({
            type: JsonTokenType.NUMBER,
            value: input,
            location: {
                start: {
                    index: 0,
                    line: 1,
                    column: 1,
                },
                end: {
                    index: input.length,
                    line: 1,
                    column: input.length + 1,
                },
            },
        });

        expect(JsonParser.parse(input)).toEqual(new JsonPrimitiveNode({
            value: expected,
            token: token,
            location: token.location,
            children: [token],
        }));
    });

    type StringScenario = {
        input: string,
        expected: string,
    };

    it.each<StringScenario>([
        {
            input: '""',
            expected: '',
        },
        {
            input: '"hello"',
            expected: 'hello',
        },
        {
            input: '"\\"hello\\""',
            expected: '"hello"',
        },
        {
            input: '"\\u0068ello"',
            expected: 'hello',
        },
        {
            input: '"\\uD83D\\uDE0A"',
            expected: '😊',
        },
        {
            input: '"😊"',
            expected: '😊',
        },
        {
            input: "''",
            expected: '',
        },
        {
            input: "'hello'",
            expected: 'hello',
        },
        {
            input: "'\\'hello\\''",
            expected: "'hello'",
        },
        {
            input: "'\u0068ello'",
            expected: 'hello',
        },
        {
            input: "'\uD83D\uDE0A'",
            expected: '😊',
        },
        {
            input: "'😊'",
            expected: '😊',
        },
    ])('should parse string $input', ({input, expected}) => {
        const token = new JsonTokenNode({
            type: JsonTokenType.STRING,
            value: input,
            location: {
                start: {
                    index: 0,
                    line: 1,
                    column: 1,
                },
                end: {
                    index: [...input].length,
                    line: 1,
                    column: [...input].length + 1,
                },
            },
        });

        expect(JsonParser.parse(input)).toEqual(new JsonPrimitiveNode({
            value: expected,
            token: token,
            location: token.location,
            children: [token],
        }));
    });

    it('should report an error parsing an invalid string', () => {
        let caughtError: unknown;

        try {
            JsonParser.parse(' "\\u{2323}"');
        } catch (error) {
            caughtError = error;
        }

        expect(caughtError).toEqual(
            new JsonParseError(
                'Unexpected token { in JSON at position 3',
                {
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
            ),
        );
    });

    it('should report an error if unexpected error occurs parsing a string', () => {
        jest.spyOn(JSON, 'parse').mockImplementation(() => {
            throw new Error('Unexpected error.');
        });

        let caughtError: unknown;

        try {
            JsonParser.parse('""');
        } catch (error) {
            caughtError = error;
        }

        expect(caughtError).toEqual(
            new JsonParseError(
                'Unexpected error.',
                {
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
            ),
        );
    });

    it('should report an error if a non-error is thrown parsing a string', () => {
        jest.spyOn(JSON, 'parse').mockImplementation(() => {
            // eslint-disable-next-line no-throw-literal -- Testing a non-error throw.
            throw 'Unexpected error.';
        });

        expect(() => JsonParser.parse('""')).toThrow('Unexpected error.');
    });

    it('should parse an empty array', () => {
        const leftBrace = new JsonTokenNode({
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
        });

        const rightBrace = new JsonTokenNode({
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
        });

        expect(JsonParser.parse('[]')).toEqual(new JsonArrayNode({
            elements: [],
            location: {
                start: leftBrace.location.start,
                end: rightBrace.location.end,
            },
            children: [leftBrace, rightBrace],
        }));
    });

    it('should parse an array with a single element', () => {
        const leftBrace = new JsonTokenNode({
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
        });

        const rightBrace = new JsonTokenNode({
            type: JsonTokenType.BRACKET_RIGHT,
            value: ']',
            location: {
                start: {
                    index: 3,
                    line: 1,
                    column: 4,
                },
                end: {
                    index: 4,
                    line: 1,
                    column: 5,
                },
            },
        });

        const numberToken = new JsonTokenNode({
            type: JsonTokenType.NUMBER,
            value: '42',
            location: {
                start: {
                    index: 1,
                    line: 1,
                    column: 2,
                },
                end: {
                    index: 3,
                    line: 1,
                    column: 4,
                },
            },
        });

        const numberNode = new JsonPrimitiveNode({
            value: 42,
            token: numberToken,
            location: numberToken.location,
            children: [numberToken],
        });

        expect(JsonParser.parse('[42]')).toEqual(
            new JsonArrayNode({
                elements: [numberNode],
                location: {
                    start: leftBrace.location.start,
                    end: rightBrace.location.end,
                },
                children: [leftBrace, numberNode, rightBrace],
            }),
        );
    });

    it('should parse an array with trailing comma', () => {
        const leftBrace = new JsonTokenNode({
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
        });

        const rightBrace = new JsonTokenNode({
            type: JsonTokenType.BRACKET_RIGHT,
            value: ']',
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
        });

        const numberToken = new JsonTokenNode({
            type: JsonTokenType.NUMBER,
            value: '42',
            location: {
                start: {
                    index: 1,
                    line: 1,
                    column: 2,
                },
                end: {
                    index: 3,
                    line: 1,
                    column: 4,
                },
            },
        });

        const numberNode = new JsonPrimitiveNode({
            value: 42,
            token: numberToken,
            location: numberToken.location,
            children: [numberToken],
        });

        const commaToken = new JsonTokenNode({
            type: JsonTokenType.COMMA,
            value: ',',
            location: {
                start: {
                    index: 3,
                    line: 1,
                    column: 4,
                },
                end: {
                    index: 4,
                    line: 1,
                    column: 5,
                },
            },
        });

        expect(JsonParser.parse('[42,]')).toEqual(
            new JsonArrayNode({
                elements: [numberNode],
                location: {
                    start: leftBrace.location.start,
                    end: rightBrace.location.end,
                },
                children: [leftBrace, numberNode, commaToken, rightBrace],
            }),
        );
    });

    it('should parse an empty object', () => {
        const leftBrace = new JsonTokenNode({
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
        });

        const rightBrace = new JsonTokenNode({
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
        });

        expect(JsonParser.parse('{}')).toEqual(new JsonObjectNode({
            properties: [],
            location: {
                start: leftBrace.location.start,
                end: rightBrace.location.end,
            },
            children: [leftBrace, rightBrace],
        }));
    });

    it('should parse an object with a single property', () => {
        const leftBrace = new JsonTokenNode({
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
        });

        const rightBrace = new JsonTokenNode({
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
        });

        const keyToken = new JsonTokenNode({
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
        });

        const keyNode = new JsonPrimitiveNode({
            value: 'key',
            token: keyToken,
            location: keyToken.location,
            children: [keyToken],
        });

        const valueToken = new JsonTokenNode({
            type: JsonTokenType.STRING,
            value: '"value"',
            location: {
                start: {
                    index: 7,
                    line: 1,
                    column: 8,
                },
                end: {
                    index: 14,
                    line: 1,
                    column: 15,
                },
            },
        });

        const valueNode = new JsonPrimitiveNode({
            value: 'value',
            token: valueToken,
            location: valueToken.location,
            children: [valueToken],
        });

        const colonToken = new JsonTokenNode({
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
        });

        const propertyNode = new JsonPropertyNode({
            key: keyNode,
            value: valueNode,
            location: {
                start: keyNode.location.start,
                end: valueNode.location.end,
            },
            children: [keyNode, colonToken, valueNode],
        });

        expect(JsonParser.parse('{"key":"value"}')).toEqual(
            new JsonObjectNode({
                properties: [propertyNode],
                location: {
                    start: leftBrace.location.start,
                    end: rightBrace.location.end,
                },
                children: [leftBrace, propertyNode, rightBrace],
            }),
        );
    });

    it('should parse an object with trailing comma', () => {
        const leftBrace = new JsonTokenNode({
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
        });

        const rightBrace = new JsonTokenNode({
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
        });

        const keyToken = new JsonTokenNode({
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
        });

        const keyNode = new JsonPrimitiveNode({
            value: 'key',
            token: keyToken,
            location: keyToken.location,
            children: [keyToken],
        });

        const valueToken = new JsonTokenNode({
            type: JsonTokenType.STRING,
            value: '"value"',
            location: {
                start: {
                    index: 7,
                    line: 1,
                    column: 8,
                },
                end: {
                    index: 14,
                    line: 1,
                    column: 15,
                },
            },
        });

        const valueNode = new JsonPrimitiveNode({
            value: 'value',
            token: valueToken,
            location: valueToken.location,
            children: [valueToken],
        });

        const colonToken = new JsonTokenNode({
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
        });

        const commaToken = new JsonTokenNode({
            type: JsonTokenType.COMMA,
            value: ',',
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
        });

        const propertyNode = new JsonPropertyNode({
            key: keyNode,
            value: valueNode,
            location: {
                start: keyNode.location.start,
                end: valueNode.location.end,
            },
            children: [keyNode, colonToken, valueNode],
        });

        expect(JsonParser.parse('{"key":"value",}')).toEqual(
            new JsonObjectNode({
                properties: [propertyNode],
                location: {
                    start: leftBrace.location.start,
                    end: rightBrace.location.end,
                },
                children: [leftBrace, propertyNode, commaToken, rightBrace],
            }),
        );
    });

    it('should parse an object with identifier key', () => {
        const leftBrace = new JsonTokenNode({
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
        });

        const rightBrace = new JsonTokenNode({
            type: JsonTokenType.BRACE_RIGHT,
            value: '}',
            location: {
                start: {
                    index: 12,
                    line: 1,
                    column: 13,
                },
                end: {
                    index: 13,
                    line: 1,
                    column: 14,
                },
            },
        });

        const keyToken = new JsonTokenNode({
            type: JsonTokenType.IDENTIFIER,
            value: 'key',
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
        });

        const keyNode = new JsonIdentifierNode({
            token: keyToken,
            location: keyToken.location,
            children: [keyToken],
        });

        const valueToken = new JsonTokenNode({
            type: JsonTokenType.STRING,
            value: '"value"',
            location: {
                start: {
                    index: 5,
                    line: 1,
                    column: 6,
                },
                end: {
                    index: 12,
                    line: 1,
                    column: 13,
                },
            },
        });

        const valueNode = new JsonPrimitiveNode({
            value: 'value',
            token: valueToken,
            location: valueToken.location,
            children: [valueToken],
        });

        const colonToken = new JsonTokenNode({
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
        });

        const propertyNode = new JsonPropertyNode({
            key: keyNode,
            value: valueNode,
            location: {
                start: keyNode.location.start,
                end: valueNode.location.end,
            },
            children: [keyNode, colonToken, valueNode],
        });

        expect(JsonParser.parse('{key:"value"}')).toEqual(
            new JsonObjectNode({
                properties: [propertyNode],
                location: {
                    start: leftBrace.location.start,
                    end: rightBrace.location.end,
                },
                children: [leftBrace, propertyNode, rightBrace],
            }),
        );
    });

    it('should fail to parse an object with reserved identifier key', () => {
        let caughtError: unknown;

        try {
            JsonParser.parse('{with:"value"}');
        } catch (error) {
            caughtError = error;
        }

        expect(caughtError).toEqual(
            new JsonParseError(
                'Reserved identifier \'with\' at 1:2.',
                {
                    start: {
                        index: 1,
                        line: 1,
                        column: 2,
                    },
                    end: {
                        index: 5,
                        line: 1,
                        column: 6,
                    },
                },
            ),
        );
    });

    it('should parse a value of the specified type', () => {
        const token = new JsonTokenNode({
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
        });

        expect(JsonParser.parse('"value"', JsonPrimitiveNode)).toEqual(
            new JsonPrimitiveNode({
                value: 'value',
                token: token,
                location: token.location,
                children: [token],
            }),
        );
    });

    it('should report an error if the result type mismatches', () => {
        let caughtError: unknown;

        try {
            JsonParser.parse('42', JsonArrayNode);
        } catch (error) {
            caughtError = error;
        }

        expect(caughtError).toEqual(
            new JsonParseError(
                'Expected JsonArrayNode, but got JsonPrimitiveNode.',
                {
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
            ),
        );
    });

    it('should fail to parse a JSON ending with invalid characters', () => {
        let caughtError: unknown;

        try {
            JsonParser.parse('{"foo": "bar"} 123', JsonArrayNode);
        } catch (error) {
            caughtError = error;
        }

        expect(caughtError).toEqual(
            new JsonParseError(
                'Unexpected token \'123\' at 1:16.',
                {
                    start: {
                        index: 15,
                        line: 1,
                        column: 16,
                    },
                    end: {
                        index: 18,
                        line: 1,
                        column: 19,
                    },
                },
            ),
        );
    });
});
