import {JsonValue} from '@croct/json';
import {
    JsonCompositeNode,
    JsonObjectDefinition,
    JsonParser,
    JsonPrimitiveNode,
    JsonPropertyNode,
    JsonStructureNode,
    JsonValueNode,
    PartialJsonCompositeDefinition,
    StructureDelimiter,
} from '../../src';

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
