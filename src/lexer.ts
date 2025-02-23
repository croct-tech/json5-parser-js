/* eslint-disable max-len -- Long regex patterns */
import {JsonToken, JsonTokenType} from './token';
import {SourcePosition} from './location';
import {identifierRegex} from './identifier';
import {JsonParseError} from './error';

type TokenPattern = {
    type: JsonTokenType,
    pattern: RegExp|string,
};

export class JsonLexer implements Iterable<JsonToken> {
    // Sorted by precedence
    private static PATTERNS: TokenPattern[] = [
        {
            type: JsonTokenType.BRACE_LEFT,
            pattern: '{',
        },
        {
            type: JsonTokenType.BRACE_RIGHT,
            pattern: '}',
        },
        {
            type: JsonTokenType.BRACKET_LEFT,
            pattern: '[',
        },
        {
            type: JsonTokenType.BRACKET_RIGHT,
            pattern: ']',
        },
        {
            type: JsonTokenType.COLON,
            pattern: ':',
        },
        {
            type: JsonTokenType.COMMA,
            pattern: ',',
        },
        {
            type: JsonTokenType.LINE_COMMENT,
            pattern: /^\/\/.*/,
        },
        {
            type: JsonTokenType.BLOCK_COMMENT,
            pattern: /^\/\*[\s\S]*?\*\//,
        },
        {
            type: JsonTokenType.STRING,
            pattern: /^"(?:[^"\r\n\u2028\u2029\\]|\\(?:.|\r\n|\r|\n|\u2028|\u2029))*"/u,
        },
        {
            type: JsonTokenType.STRING,
            pattern: /^'(?:[^'\r\n\u2028\u2029\\]|\\(?:.|\r\n|\r|\n|\u2028|\u2029))*'/u,
        },
        {
            type: JsonTokenType.NEWLINE,
            pattern: /^(\r?\n)/,
        },
        {
            type: JsonTokenType.WHITESPACE,
            pattern: /^[ \r\t\v\f\u00A0\u2028\u2029\uFEFF\u1680\u2000-\u200A\u202F\u205F\u3000]+/,
        },
        {
            type: JsonTokenType.NUMBER,
            pattern: /^[-+]?((?:NaN|Infinity)(?![$_\u200C\u200D\p{ID_Continue}])|0[xX][\da-fA-F]+|(?:(?:0|[1-9]\d*)(?:\.\d*)?|\.\d*)(?:[eE][+-]?\d+)?)/u,
        },
        {
            type: JsonTokenType.NULL,
            pattern: /^null(?![$_\u200C\u200D\p{ID_Continue}])/u,
        },
        {
            type: JsonTokenType.BOOLEAN,
            pattern: /^(true|false)(?![$_\u200C\u200D\p{ID_Continue}])/u,
        },
        {
            type: JsonTokenType.IDENTIFIER,
            pattern: new RegExp(`^${identifierRegex.source}`, identifierRegex.flags),
        },
    ];

    private remaining: string;

    private current: JsonToken|null = null;

    public constructor(source: string) {
        this.remaining = source;
    }

    public static tokenize(source: string): JsonToken[] {
        return [...new JsonLexer(source)];
    }

    public isEof(): boolean {
        return this.current?.type === JsonTokenType.EOF;
    }

    public [Symbol.iterator](): Iterator<JsonToken> {
        return {
            next: () => (
                this.isEof()
                    ? {
                        done: true,
                        value: undefined,
                    }
                    : {
                        done: false,
                        value: this.next(),
                    }
            ),
        };
    }

    public skipInsignificant(): JsonToken[] {
        return this.skip(
            JsonTokenType.WHITESPACE,
            JsonTokenType.NEWLINE,
            JsonTokenType.LINE_COMMENT,
            JsonTokenType.BLOCK_COMMENT,
        );
    }

    public skip(...types: JsonTokenType[]): JsonToken[] {
        const tokens: JsonToken[] = [];

        while (!this.isEof() && this.matches(...types)) {
            tokens.push(this.peek());
            this.next();
        }

        return tokens;
    }

    public expect<T extends JsonTokenType>(type: T, ...other: T[]): JsonToken<T> {
        const token = this.peek();

        const types = [type, ...other];

        if (!JsonLexer.isTokenType(token, types)) {
            const {line, column} = token.location.start;
            const expectedTypes = types.length === 1
                ? types[0]
                : `either ${types.slice(0, -1).join(', ')} or ${types[types.length - 1]}`;

            throw new JsonParseError(
                `Expected ${expectedTypes}, but got ${token.type} at ${line}:${column}.`,
                token.location,
            );
        }

        return token;
    }

    public consume<T extends JsonTokenType>(type: T, ...types: T[]): JsonToken<T> {
        const token = this.expect(type, ...types);

        if (!this.isEof()) {
            this.next();
        }

        return token;
    }

    public matches(...types: JsonTokenType[]): boolean {
        return JsonLexer.isTokenType(this.peek(), types);
    }

    public peek(): JsonToken {
        if (this.current === null) {
            throw new Error('No token has been consumed yet.');
        }

        return this.current;
    }

    public next(): JsonToken {
        if (this.isEof()) {
            throw new Error('The end of the input has been reached.');
        }

        if (this.remaining === '') {
            this.current = this.createToken(JsonTokenType.EOF, '');
        } else {
            this.current = this.match();
            this.remaining = this.remaining.slice(this.current.value.length);
        }

        return this.current;
    }

    private match(): JsonToken {
        for (const {type, pattern} of JsonLexer.PATTERNS) {
            if (typeof pattern === 'string') {
                if (this.remaining.startsWith(pattern)) {
                    return this.createToken(type, pattern);
                }

                continue;
            }

            const match = this.remaining.match(pattern);

            if (match !== null) {
                return this.createToken(type, match[0]);
            }
        }

        const start: SourcePosition = {
            index: this.current?.location.end.index ?? 0,
            line: this.current?.location.end.line ?? 1,
            column: this.current?.location.end.column ?? 1,
        };

        const end: SourcePosition = {
            index: start.index + 1,
            line: start.line,
            column: start.column + 1,
        };

        const char = this.remaining[0];

        throw new JsonParseError(`Unexpected token '${char}' at ${start.line}:${start.column}.`, {
            start: start,
            end: end,
        });
    }

    private createToken(type: JsonTokenType, value: string): JsonToken {
        const start: SourcePosition = {
            index: this.current?.location.end.index ?? 0,
            line: this.current?.location.end.line ?? 1,
            column: this.current?.location.end.column ?? 1,
        };

        const end = {
            index: start.index,
            line: start.line,
            column: start.column,
        } satisfies SourcePosition;

        end.index += [...value].length;

        for (const char of value) {
            if (char === '\n') {
                end.line++;
                end.column = 1;
            } else {
                end.column++;
            }
        }

        return {
            type: type,
            value: value,
            location: {
                start: start,
                end: end,
            },
        };
    }

    private static isTokenType<T extends JsonTokenType>(token: JsonToken, types: T[]): token is JsonToken<T> {
        return types.length === 0 || types.includes(token.type as T);
    }
}
