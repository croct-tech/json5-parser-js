import {JsonLexer} from './lexer';
import {JsonToken, JsonTokenType} from './token';
import {
    JsonPropertyNode,
    JsonIdentifierNode,
    JsonValueNode,
    JsonPrimitiveNode,
    JsonTokenNode,
    JsonArrayNode,
    JsonNode,
    JsonObjectNode,
    JsonNumberNode,
    JsonStringNode,
    JsonNullNode,
    JsonBooleanNode,
} from './node';
import {isReserved} from './identifier';
import {JsonError, JsonParseError} from './error';

export class JsonParser {
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

        let {value} = token;

        if (value.startsWith("'")) {
            value = value.slice(1, -1)
                // Unescape single quotes and escape double quotes
                .replace(
                    /((?:^|[^\\])(?:\\\\)*)\\(["'])/g,
                    (_, preceding, quote) => `${preceding}${quote === '"' ? '\\"' : "'"}`,
                );

            value = `"${value}"`;
        }

        value = value.replace(/\\(?:\r\n|\r|\n|\u2028|\u2029)/gu, '');

        const tokenNode = new JsonTokenNode(token);

        let parsedValue: string;

        try {
            parsedValue = JSON.parse(value);
        } catch (error) {
            if (error instanceof Error) {
                throw new JsonParseError(JsonParser.getJsonError(error, token), token.location);
            }

            throw error;
        }

        return new JsonPrimitiveNode({
            token: tokenNode,
            value: parsedValue,
            children: [tokenNode],
            location: token.location,
        });
    }

    private static getJsonError(error: Error, token: JsonToken): string {
        const match = error.message.match(/^(.+) at position (\d+) \(line (\d+) column (\d+)\)/);

        if (match !== null) {
            const line = token.location.start.line + Number(match[3]) - 1;
            const column = token.location.start.column + Number(match[4]) - 1;

            return `${match[1]} at ${line}:${column}.`;
        }

        return error.message;
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
        const children: Array<JsonNode|JsonToken> = [
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
        const children: Array<JsonNode|JsonToken> = [
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
        const children: Array<JsonNode|JsonToken> = [];

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

    private static createChildren(children: Array<JsonNode|JsonToken>): JsonNode[] {
        return children.map(child => {
            if (child instanceof JsonNode) {
                return child;
            }

            return new JsonTokenNode(child);
        });
    }
}
