import {JsonLexer} from './lexer';
import type {JsonToken} from './token';
import {JsonTokenType} from './token';
import type {JsonValueNode, JsonNumberNode, JsonStringNode, JsonNullNode, JsonBooleanNode} from './node';
import {
    JsonPropertyNode,
    JsonIdentifierNode,
    JsonPrimitiveNode,
    JsonTokenNode,
    JsonArrayNode,
    JsonNode,
    JsonObjectNode,
} from './node';
import {isReserved} from './identifier';
import {JsonError, JsonParseError} from './error';

export class JsonParser {
    // JSON spellings of the JSON5-only escapes. A Map, not an object literal, so inherited
    // properties never count as escapes. Escaped line terminators are line continuations.
    private static readonly ESCAPES = new Map([
        ['v', '\\u000b'],
        ['0', '\\u0000'],
        ['\r\n', ''],
        ['\r', ''],
        ['\n', ''],
        ['\u2028', ''],
        ['\u2029', ''],
    ]);

    private readonly lexer: JsonLexer;

    public constructor(source: string) {
        this.lexer = new JsonLexer(source);
    }

    public static parse<T extends JsonValueNode>(source: string, type: {new(...args: any[]): T}): T;

    public static parse(source: string): JsonValueNode;

    public static parse<T extends JsonValueNode>(source: string, type?: {new(...args: any[]): T}): JsonValueNode {
        const parser = new JsonParser(source);

        if (type !== undefined) {
            return parser.parseValue(type);
        }

        return parser.parseValue();
    }

    public parseValue<T extends JsonValueNode>(type: {new(...args: any[]): T}): T;

    public parseValue(): JsonValueNode;

    public parseValue<T extends JsonValueNode>(type?: {new(...args: any[]): T}): JsonValueNode {
        const node = this.parseRoot();

        if (type !== undefined && !(node instanceof type)) {
            throw new JsonError(`Expected ${type.name}, but got ${node.constructor.name}.`);
        }

        return node;
    }

    private parseRoot(): JsonValueNode {
        this.lexer.next();

        const leadingTokens = this.lexer.skipInsignificant();

        const node = this.parseNext();

        const trailingTokens = this.lexer.skipInsignificant();

        node.children.unshift(...JsonParser.createChildren(leadingTokens));
        node.children.push(...JsonParser.createChildren(trailingTokens));

        if (!this.lexer.isEof()) {
            const token = this.lexer.peek();
            const position = token.location.start;

            throw new JsonParseError(
                `Unexpected token '${token.value}' at ${position.line}:${position.column}.`,
                token.location,
            );
        }

        return node;
    }

    private parseNext(): JsonValueNode {
        const token = this.lexer.peek();

        switch (token.type) {
            case JsonTokenType.BRACE_LEFT:
                return this.parseObject();

            case JsonTokenType.BRACKET_LEFT:
                return this.parseArray();

            case JsonTokenType.NUMBER:
                return this.parseNumber();

            case JsonTokenType.STRING:
                return this.parseString();

            case JsonTokenType.BOOLEAN:
                return this.parseBoolean();

            case JsonTokenType.NULL:
                return this.parseNull();

            default: {
                const position = token.location.start;

                throw new JsonParseError(
                    `Unexpected token '${token.value}' at ${position.line}:${position.column}.`,
                    token.location,
                );
            }
        }
    }

    private parseNumber(): JsonNumberNode {
        const token = this.lexer.consume(JsonTokenType.NUMBER);
        const tokenNode = new JsonTokenNode(token);

        return new JsonPrimitiveNode({
            token: tokenNode,
            value: this.parseNumberValue(token),
            children: [tokenNode],
            location: token.location,
        });
    }

    private parseNumberValue(token: JsonToken<JsonTokenType.NUMBER>): number {
        let {value} = token;

        let sign = 1;

        if (value.startsWith('+')) {
            value = value.slice(1);
        } else if (value.startsWith('-')) {
            sign = -1;
            value = value.slice(1);
        }

        if (value === 'Infinity') {
            return sign * Infinity;
        }

        if (value === 'NaN') {
            return NaN;
        }

        if (value.startsWith('.')) {
            value = `0${value}`;
        } else {
            value = value.replace(/\.(?!\d)/, '');
        }

        if (value.startsWith('0x') || value.startsWith('0X')) {
            return sign * Number.parseInt(value, 16);
        }

        return sign * JSON.parse(value);
    }

    private parseString(): JsonStringNode {
        const token = this.lexer.consume(JsonTokenType.STRING);
        const tokenNode = new JsonTokenNode(token);

        return new JsonPrimitiveNode({
            token: tokenNode,
            value: JsonParser.parseJsonString(token.value) ?? JSON.parse(`"${JsonParser.toJsonString(token)}"`),
            children: [tokenNode],
            location: token.location,
        });
    }

    /**
     * Parses a double-quoted string that is already valid JSON, which means the same in JSON5.
     */
    private static parseJsonString(value: string): string | undefined {
        if (!value.startsWith('"')) {
            return undefined;
        }

        try {
            return JSON.parse(value);
        } catch {
            return undefined;
        }
    }

    /**
     * Rewrites the content of a JSON5-only string token as the content of an equivalent JSON string.
     *
     * Decoding is left to JSON.parse, which is much faster and leaner than decoding in JavaScript.
     * Only JSON5-specific syntax is rewritten, in bounded batches, so memory stays proportional
     * to the input even for strings with millions of escapes.
     */
    private static toJsonString(token: JsonToken): string {
        const content = token.value.slice(1, -1);
        const parts: string[] = [];
        let json = '';
        let offset = 0;

        // Standard JSON escapes are matched only to skip them, keeping the scan aligned on backslashes
        // eslint-disable-next-line no-control-regex -- Unescaped control characters are invalid in JSON.
        const pattern = /\\(?:(["\\/bfnrt]|u[\da-fA-F]{4})|x([\da-fA-F]{2})|(0\d?|\r\n|[^]))|["\u0000-\u001F]/gu;

        for (const match of content.matchAll(pattern)) {
            const [sequence, standard, hex, escape] = match;

            if (standard !== undefined) {
                continue;
            }

            let replacement: string | undefined;

            if (hex !== undefined) {
                replacement = `\\u00${hex}`;
            } else if (escape === undefined) {
                // An unescaped double quote (in a single-quoted string) or control character
                replacement = JSON.stringify(sequence).slice(1, -1);
            } else {
                // Any other character escapes to itself, except digits, x and u (spec: NonEscapeCharacter)
                replacement = JsonParser.ESCAPES.get(escape)
                    ?? (/[\dux]/.test(escape) ? undefined : JSON.stringify(escape).slice(1, -1));
            }

            if (replacement === undefined) {
                throw new JsonParseError(
                    `Invalid string at ${token.location.start.line}:${token.location.start.column}: `
                    + `invalid escape sequence \\${escape}.`,
                    token.location,
                );
            }

            parts.push(content.slice(offset, match.index), replacement);
            offset = match.index + sequence.length;

            if (parts.length >= 1024) {
                json += parts.join('');
                parts.length = 0;
            }
        }

        return json + parts.join('') + content.slice(offset);
    }

    private parseNull(): JsonNullNode {
        const token = this.lexer.consume(JsonTokenType.NULL);
        const tokenNode = new JsonTokenNode(token);

        return new JsonPrimitiveNode({
            token: tokenNode,
            value: null,
            children: [tokenNode],
            location: token.location,
        });
    }

    private parseBoolean(): JsonBooleanNode {
        const token = this.lexer.consume(JsonTokenType.BOOLEAN);
        const tokenNode = new JsonTokenNode(token);

        return new JsonPrimitiveNode({
            token: tokenNode,
            value: token.value === 'true',
            children: [tokenNode],
            location: token.location,
        });
    }

    private parseArray(): JsonArrayNode {
        const children: Array<JsonNode | JsonToken> = [
            this.lexer.consume(JsonTokenType.BRACKET_LEFT),
            ...this.lexer.skipInsignificant(),
        ];

        const elements: JsonValueNode[] = [];

        while (!this.lexer.matches(JsonTokenType.BRACKET_RIGHT)) {
            const element = this.parseNext();

            elements.push(element);

            children.push(element, ...this.lexer.skipInsignificant());

            if (!this.lexer.matches(JsonTokenType.BRACKET_RIGHT)) {
                children.push(this.lexer.consume(JsonTokenType.COMMA), ...this.lexer.skipInsignificant());
            }
        }

        children.push(this.lexer.consume(JsonTokenType.BRACKET_RIGHT));

        return new JsonArrayNode({
            elements: elements,
            children: JsonParser.createChildren(children),
            location: {
                start: children[0].location.start,
                end: children[children.length - 1].location.end,
            },
        });
    }

    private parseObject(): JsonObjectNode {
        const children: Array<JsonNode | JsonToken> = [
            this.lexer.consume(JsonTokenType.BRACE_LEFT),
            ...this.lexer.skipInsignificant(),
        ];

        const properties: JsonPropertyNode[] = [];

        while (!this.lexer.matches(JsonTokenType.BRACE_RIGHT)) {
            const property = this.parseObjectProperty();

            properties.push(property);

            children.push(property, ...this.lexer.skipInsignificant());

            if (!this.lexer.matches(JsonTokenType.BRACE_RIGHT)) {
                children.push(this.lexer.consume(JsonTokenType.COMMA), ...this.lexer.skipInsignificant());
            }
        }

        children.push(this.lexer.consume(JsonTokenType.BRACE_RIGHT));

        return new JsonObjectNode({
            properties: properties,
            children: JsonParser.createChildren(children),
            location: {
                start: children[0].location.start,
                end: children[children.length - 1].location.end,
            },
        });
    }

    private parseObjectProperty(): JsonPropertyNode {
        const children: Array<JsonNode | JsonToken> = [];

        this.lexer.expect(JsonTokenType.STRING, JsonTokenType.IDENTIFIER);

        const key = this.lexer.matches(JsonTokenType.STRING)
            ? this.parseString()
            : this.parseIdentifier();

        children.push(
            key,
            ...this.lexer.skipInsignificant(),
            this.lexer.consume(JsonTokenType.COLON),
            ...this.lexer.skipInsignificant(),
        );

        const value = this.parseNext();

        children.push(value);

        return new JsonPropertyNode({
            key: key,
            value: value,
            children: JsonParser.createChildren(children),
            location: {
                start: children[0].location.start,
                end: children[children.length - 1].location.end,
            },
        });
    }

    private parseIdentifier(): JsonIdentifierNode {
        const token = this.lexer.consume(JsonTokenType.IDENTIFIER);

        if (isReserved(token.value)) {
            const location = token.location.start;

            throw new JsonParseError(
                `Reserved identifier '${token.value}' at ${location.line}:${location.column}.`,
                token.location,
            );
        }

        const tokenNode = new JsonTokenNode(token);

        return new JsonIdentifierNode({
            token: tokenNode,
            children: [tokenNode],
            location: token.location,
        });
    }

    private static createChildren(children: Array<JsonNode | JsonToken>): JsonNode[] {
        return children.map(child => {
            if (child instanceof JsonNode) {
                return child;
            }

            return new JsonTokenNode(child);
        });
    }
}
