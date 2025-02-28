import {JsonValue} from '@croct/json';
import {
    Formatting,
    JsonCompositeNode,
    JsonIdentifierNode,
    JsonNode,
    JsonObjectDefinition,
    JsonObjectNode,
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
import {multiline} from '../utils';

describe('StructureNode', () => {
    class TestStructureNode extends JsonStructureNode {
        private readonly propertyNodes: JsonPropertyNode[];

        public constructor(definition: PartialJsonCompositeDefinition<JsonObjectDefinition>) {
            super(definition);

            this.propertyNodes = [...definition.properties];
        }

        protected getList(): JsonCompositeNode[] {
            return [...this.propertyNodes];
        }

        protected getDelimiter(): StructureDelimiter {
            return StructureDelimiter.OBJECT;
        }

        protected getMaxDepth(): number {
            return 2;
        }

        public update(): JsonValueNode {
            throw new Error('Method not implemented.');
        }

        public toJSON(): JsonValue {
            throw new Error('Method not implemented.');
        }

        public clone(): TestStructureNode {
            const clones: Map<JsonPropertyNode, JsonPropertyNode> = new Map();

            for (const property of this.propertyNodes) {
                clones.set(property, property.clone());
            }

            return new TestStructureNode({
                properties: [...clones.values()],
                children: this.children.map(child => clones.get(child as JsonPropertyNode) ?? child.clone()),
            });
        }

        public isEquivalent(other: JsonNode): boolean {
            if (!(other instanceof TestStructureNode)) {
                return false;
            }

            const entries = Object.fromEntries(other.propertyNodes.map(property => [property.key.toJSON(), property]));

            return this.propertyNodes.every(
                property => entries[property.key.toJSON()]?.isEquivalent(property) === true,
            );
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

    type Scenario = {
        input: string,
        expected: string,
        formatting?: Formatting,
    };

    it.each(Object.entries<Scenario>({
        'different quota styles': {
            input: multiline`
            {
                foo: "bar",
                "baz": "qux",
                'quux': "corge"
            }
            `,
            expected: multiline`
            {
                foo: "bar",
                "baz": "qux",
                'quux': "corge"
            }
            `,
        },
        'nested structures': {
            input: multiline`
            {
                "array":[1, 2, 3],
                "obj": {
                    "foo": "bar"
                }
            }
            `,
            expected: multiline`
            {
                "array":[1, 2, 3],
                "obj": {
                    "foo": "bar"
                }
            }
            `,
        },
        'leading indentation': {
            input: multiline`
            {
                "foo": 1,
                "bar":2,
                "baz": 3
            }
            `,
            expected: multiline`
            {
                "foo": 1,
                "bar":2,
                "baz": 3
            }
            `,
        },
        'with inline comment': {
            input: multiline`
            {
                foo: "bar",
                // Some comment
                baz: "qux",
            }
            `,
            expected: multiline`
            {
                foo: "bar",
                // Some comment
                baz: "qux",
            }
            `,
        },
        'with multiline comment': {
            input: multiline`
            {
                foo: "bar",
                /* 
                Multi-line comment:
                This is a placeholder object commonly used in programming examples.
                The fields below are just for demonstration purposes.
                */
                baz: "qux",
            }
            `,
            expected: multiline`
            {
                foo: "bar",
                /* 
                Multi-line comment:
                This is a placeholder object commonly used in programming examples.
                The fields below are just for demonstration purposes.
                */
                baz: "qux",
            }
            `,
        },
    }))('should rebuild itself detecting %s', (_, scenario) => {
        const node = JsonParser.parse<JsonObjectNode>(scenario.input, JsonObjectNode);

        const structureNode = new TestStructureNode({
            children: node.children,
            properties: node.properties,
        });

        structureNode.rebuild(scenario.formatting);

        expect(structureNode.toString()).toStrictEqual(scenario.expected);
    });

    it('should rebuild with comma spacing', () => {
        const property = new JsonPropertyNode({
            children: [],
            key: JsonIdentifierNode.of('foo'),
            value: JsonPrimitiveNode.of('bar'),
        });

        const structureNode = new TestStructureNode({
            children: [
                new JsonTokenNode({
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                }),
                new JsonTokenNode({
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                }),
            ],
            properties: [property],
        });

        structureNode.rebuild({
            object: {
                colonSpacing: true,
            },
        });

        expect(structureNode.toString()).toStrictEqual('{foo: "bar"}');
    });
});
