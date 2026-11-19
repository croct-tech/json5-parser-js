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
    // A Map, not an object literal, so inherited properties never count as escapes.
    // Escaped line terminators are line continuations and decode to nothing.
    private static readonly ESCAPES = new Map([
        ['b', '\b'],
        ['f', '\f'],
        ['n', '\n'],
        ['r', '\r'],
        ['t', '\t'],
        ['v', '\v'],
        ['0', '\0'],
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
            value: JsonParser.parseJsonString(token.value) ?? JsonParser.decodeString(token),
            children: [tokenNode],
            location: token.location,
        });
    }

    /**
     * Parses a string that is also valid JSON natively, which is much faster and leaner.
     *
     * JSON strings mean the same in JSON5, so only JSON5-specific syntax needs the decoder.
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

    private static decodeString(token: JsonToken): string {
        const content = token.value.slice(1, -1);
        // Collected and joined once: replace() with a callback buffers every match,
        // and += can keep the result as a rope of pieces until the engine flattens it
        const parts: string[] = [];
        let offset = 0;

        for (const match of content.matchAll(/\\(?:u([\da-fA-F]{4})|x([\da-fA-F]{2})|(0\d?|\r\n|[^]))/gu)) {
            const [sequence, unicode, hex, escape = ''] = match;
            const code = unicode ?? hex;

            // Any other character escapes to itself, except digits, x and u (spec: NonEscapeCharacter)
            const replacement = code !== undefined
                ? String.fromCharCode(Number.parseInt(code, 16))
                : JsonParser.ESCAPES.get(escape) ?? (/[\dux]/.test(escape) ? undefined : escape);

            if (replacement === undefined) {
                throw new JsonParseError(
                    `Invalid string at ${token.location.start.line}:${token.location.start.column}: `
                    + `invalid escape sequence \\${escape}.`,
                    token.location,
                );
            }

            parts.push(content.slice(offset, match.index), replacement);
            offset = match.index + sequence.length;
        }

        parts.push(content.slice(offset));

        // The round-trip forces a fresh copy: a single-piece join returns a slice of the source,
        // which would keep the whole source text alive for as long as the value is referenced
        return JSON.parse(JSON.stringify(parts.join('')));
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
