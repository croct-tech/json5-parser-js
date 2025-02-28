import {JsonValue} from '@croct/json';
import {
    JsonCompositeNode,
    JsonObjectDefinition,
    JsonParser,
    JsonPrimitiveNode,
    JsonPropertyNode,
    JsonStructureNode,
    JsonTokenNode,
    JsonTokenType,
    JsonValueNode,
    PartialJsonCompositeDefinition,
    StructureDelimiter,
} from '../../src';

describe('StructureDelimiter', () => {
    it('should determine whether the token is a start token', () => {
        const leftBrace = new JsonTokenNode({
            type: JsonTokenType.BRACE_LEFT,
            value: '{',
        });

        const leftBracket = new JsonTokenNode({
            type: JsonTokenType.BRACKET_LEFT,
            value: '[',
        });

        const other = new JsonTokenNode({
            type: JsonTokenType.COLON,
            value: ':',
        });

        expect(StructureDelimiter.isStartToken(leftBrace)).toBeTrue();
        expect(StructureDelimiter.isStartToken(leftBracket)).toBeTrue();
        expect(StructureDelimiter.isStartToken(other)).toBeFalse();
    });

    it('should determine whether the token is an end token', () => {
        const rightBrace = new JsonTokenNode({
            type: JsonTokenType.BRACE_RIGHT,
            value: '}',
        });

        const rightBracket = new JsonTokenNode({
            type: JsonTokenType.BRACKET_RIGHT,
            value: ']',
        });

        const other = new JsonTokenNode({
            type: JsonTokenType.COLON,
            value: ':',
        });

        expect(StructureDelimiter.isEndToken(rightBrace)).toBeTrue();
        expect(StructureDelimiter.isEndToken(rightBracket)).toBeTrue();
        expect(StructureDelimiter.isEndToken(other)).toBeFalse();
    });

    it('should return the start token for the delimiter', () => {
        expect(StructureDelimiter.getStartToken(StructureDelimiter.OBJECT)).toStrictEqual(
            new JsonTokenNode({
                type: JsonTokenType.BRACE_LEFT,
                value: '{',
            }),
        );

        expect(StructureDelimiter.getStartToken(StructureDelimiter.ARRAY)).toStrictEqual(
            new JsonTokenNode({
                type: JsonTokenType.BRACKET_LEFT,
                value: '[',
            }),
        );
    });

    it('should return the end token for the delimiter', () => {
        expect(StructureDelimiter.getEndToken(StructureDelimiter.OBJECT)).toStrictEqual(
            new JsonTokenNode({
                type: JsonTokenType.BRACE_RIGHT,
                value: '}',
            }),
        );

        expect(StructureDelimiter.getEndToken(StructureDelimiter.ARRAY)).toStrictEqual(
            new JsonTokenNode({
                type: JsonTokenType.BRACKET_RIGHT,
                value: ']',
            }),
        );
    });
});

describe('StructureNode', () => {
    class TestStructureNode extends JsonStructureNode {
        private readonly propertyNodes: JsonPropertyNode[];

        public constructor(definition: PartialJsonCompositeDefinition<JsonObjectDefinition>) {
            super(definition);

            this.propertyNodes = [...definition.properties];
        }

        public clone(): JsonStructureNode {
            throw new Error('Method not implemented.');
        }

        protected getList(): JsonCompositeNode[] {
            return [...this.propertyNodes];
        }

        protected getDelimiter(): StructureDelimiter {
            return StructureDelimiter.OBJECT;
        }

        protected getMaxDepth(): number {
            return 1;
        }

        public update(): JsonValueNode {
            throw new Error('Method not implemented.');
        }

        public toJSON(): JsonValue {
            throw new Error('Method not implemented.');
        }

        public isEquivalent(): boolean {
            throw new Error('Method not implemented.');
        }
    }

    it('should reset its children', () => {
        const property = new JsonPropertyNode({
            children: [JsonPrimitiveNode.of('foo')],
            key: JsonPrimitiveNode.of('foo'),
            value: JsonPrimitiveNode.of('bar'),
        });

        const structureNode = new TestStructureNode({
            properties: [property],
            children: [property],
        });

        structureNode.reset();

        expect(property.children).toBeEmpty();
        expect(structureNode.children).toBeEmpty();
    });

    it('should rebuild itself', () => {
        const node = JsonParser.parse("{foo: 'bar'}");

        node.rebuild();

        expect(node.toString()).toStrictEqual("{foo: 'bar'}");
    });
});
