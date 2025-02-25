import {JsonValue} from '@croct/json';
import {
    JsonArrayNode,
    JsonCompositeNode,
    JsonIdentifierNode,
    JsonNode,
    JsonObjectDefinition,
    JsonPrimitiveNode,
    JsonPropertyNode,
    JsonStructureNode,
    JsonTokenNode,
    JsonTokenType,
    JsonValueNode,
    PartialJsonCompositeDefinition,
    SourceLocation,
    StructureDelimiter,
} from '../../src';

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

        public clone(): JsonCompositeNode {
            throw new Error('Method not implemented.');
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
            location: SourceLocation.unknown(),
            children: [JsonPrimitiveNode.of('foo')],
            key: JsonPrimitiveNode.of('foo'),
            value: JsonPrimitiveNode.of('bar'),
        });

        const structureNode = new TestStructureNode({
            location: SourceLocation.unknown(),
            children: [
                JsonPrimitiveNode.of('foo'),
            ],
            properties: [property],
        });

        expect(property.children).toStrictEqual([JsonPrimitiveNode.of('foo')]);
        expect(structureNode.children).toStrictEqual([JsonPrimitiveNode.of('foo')]);

        structureNode.reset();

        expect(property.children).toBeEmpty();
        expect(structureNode.children).toBeEmpty();
    });

    it('should rebuild with indentation size', () => {
        const property = new JsonPropertyNode({
            location: SourceLocation.unknown(),
            children: [],
            key: JsonIdentifierNode.of('foo'),
            value: JsonPrimitiveNode.of('bar'),
        });

        const structureNode = new TestStructureNode({
            location: SourceLocation.unknown(),
            children: [
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                }),
            ],
            properties: [property],
        });

        structureNode.rebuild({
            object: {
                indentationSize: 4,
                leadingIndentation: true,
            },
        });

        expect(structureNode).toStrictEqual(new TestStructureNode({
            location: SourceLocation.unknown(),
            children: [
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.NEWLINE,
                    value: '\n',
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.WHITESPACE,
                    value: '    ',
                }),
                new JsonPropertyNode({
                    location: SourceLocation.unknown(),
                    children: [
                        new JsonIdentifierNode({
                            location: SourceLocation.unknown(),
                            children: [
                                new JsonTokenNode({
                                    location: SourceLocation.unknown(),
                                    type: JsonTokenType.IDENTIFIER,
                                    value: 'foo',
                                }),
                            ],
                            token: new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.IDENTIFIER,
                                value: 'foo',
                            }),
                        }),
                        new JsonTokenNode({
                            location: SourceLocation.unknown(),
                            type: JsonTokenType.COLON,
                            value: ':',
                        }),
                        new JsonPrimitiveNode({
                            location: SourceLocation.unknown(),
                            children: [
                                new JsonTokenNode({
                                    location: SourceLocation.unknown(),
                                    type: JsonTokenType.STRING,
                                    value: '"bar"',
                                }),
                            ],
                            token: new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.STRING,
                                value: '"bar"',
                            }),
                            value: 'bar',
                        }),
                    ],
                    key: new JsonIdentifierNode({
                        location: SourceLocation.unknown(),
                        children: [
                            new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.IDENTIFIER,
                                value: 'foo',
                            }),
                        ],
                        token: new JsonTokenNode({
                            location: SourceLocation.unknown(),
                            type: JsonTokenType.IDENTIFIER,
                            value: 'foo',
                        }),
                    }),
                    value: new JsonPrimitiveNode({
                        location: SourceLocation.unknown(),
                        children: [
                            new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.STRING,
                                value: '"bar"',
                            }),
                        ],
                        token: new JsonTokenNode({
                            location: SourceLocation.unknown(),
                            type: JsonTokenType.STRING,
                            value: '"bar"',
                        }),
                        value: 'bar',
                    }),
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                }),
            ],
            properties: [property],
        }));
    });

    it('should rebuild with comma spacing', () => {
        const property = new JsonPropertyNode({
            location: SourceLocation.unknown(),
            children: [],
            key: JsonIdentifierNode.of('foo'),
            value: JsonPrimitiveNode.of('bar'),
        });

        const structureNode = new TestStructureNode({
            location: SourceLocation.unknown(),
            children: [
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
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

        expect(structureNode).toStrictEqual(new TestStructureNode({
            location: SourceLocation.unknown(),
            children: [
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                }),
                new JsonPropertyNode({
                    location: SourceLocation.unknown(),
                    children: [
                        new JsonIdentifierNode({
                            location: SourceLocation.unknown(),
                            children: [
                                new JsonTokenNode({
                                    location: SourceLocation.unknown(),
                                    type: JsonTokenType.IDENTIFIER,
                                    value: 'foo',
                                }),
                            ],
                            token: new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.IDENTIFIER,
                                value: 'foo',
                            }),
                        }),
                        new JsonTokenNode({
                            location: SourceLocation.unknown(),
                            type: JsonTokenType.COLON,
                            value: ':',
                        }),
                        new JsonTokenNode({
                            location: SourceLocation.unknown(),
                            type: JsonTokenType.WHITESPACE,
                            value: ' ',
                        }),
                        new JsonPrimitiveNode({
                            location: SourceLocation.unknown(),
                            children: [
                                new JsonTokenNode({
                                    location: SourceLocation.unknown(),
                                    type: JsonTokenType.STRING,
                                    value: '"bar"',
                                }),
                            ],
                            token: new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.STRING,
                                value: '"bar"',
                            }),
                            value: 'bar',
                        }),
                    ],
                    key: new JsonIdentifierNode({
                        location: SourceLocation.unknown(),
                        children: [
                            new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.IDENTIFIER,
                                value: 'foo',
                            }),
                        ],
                        token: new JsonTokenNode({
                            location: SourceLocation.unknown(),
                            type: JsonTokenType.IDENTIFIER,
                            value: 'foo',
                        }),
                    }),
                    value: new JsonPrimitiveNode({
                        location: SourceLocation.unknown(),
                        children: [
                            new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.STRING,
                                value: '"bar"',
                            }),
                        ],
                        token: new JsonTokenNode({
                            location: SourceLocation.unknown(),
                            type: JsonTokenType.STRING,
                            value: '"bar"',
                        }),
                        value: 'bar',
                    }),
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                }),
            ],
            properties: [property],
        }));
    });

    it('should rebuild with entry indentation', () => {
        const property = new JsonPropertyNode({
            location: SourceLocation.unknown(),
            children: [],
            key: JsonIdentifierNode.of('foo'),
            value: JsonPrimitiveNode.of('bar'),
        });

        const structureNode = new TestStructureNode({
            location: SourceLocation.unknown(),
            children: [
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                }),
            ],
            properties: [property],
        });

        structureNode.rebuild({
            object: {
                entryIndentation: true,
            },
        });

        expect(structureNode).toStrictEqual(new TestStructureNode({
            location: SourceLocation.unknown(),
            children: [
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                }),
                new JsonPropertyNode({
                    location: SourceLocation.unknown(),
                    children: [
                        new JsonIdentifierNode({
                            location: SourceLocation.unknown(),
                            children: [
                                new JsonTokenNode({
                                    location: SourceLocation.unknown(),
                                    type: JsonTokenType.IDENTIFIER,
                                    value: 'foo',
                                }),
                            ],
                            token: new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.IDENTIFIER,
                                value: 'foo',
                            }),
                        }),
                        new JsonTokenNode({
                            location: SourceLocation.unknown(),
                            type: JsonTokenType.COLON,
                            value: ':',
                        }),
                        new JsonPrimitiveNode({
                            location: SourceLocation.unknown(),
                            children: [
                                new JsonTokenNode({
                                    location: SourceLocation.unknown(),
                                    type: JsonTokenType.STRING,
                                    value: '"bar"',
                                }),
                            ],
                            token: new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.STRING,
                                value: '"bar"',
                            }),
                            value: 'bar',
                        }),
                    ],
                    key: new JsonIdentifierNode({
                        location: SourceLocation.unknown(),
                        children: [
                            new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.IDENTIFIER,
                                value: 'foo',
                            }),
                        ],
                        token: new JsonTokenNode({
                            location: SourceLocation.unknown(),
                            type: JsonTokenType.IDENTIFIER,
                            value: 'foo',
                        }),
                    }),
                    value: new JsonPrimitiveNode({
                        location: SourceLocation.unknown(),
                        children: [
                            new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.STRING,
                                value: '"bar"',
                            }),
                        ],
                        token: new JsonTokenNode({
                            location: SourceLocation.unknown(),
                            type: JsonTokenType.STRING,
                            value: '"bar"',
                        }),
                        value: 'bar',
                    }),
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                }),
            ],
            properties: [property],
        }));
    });

    it('should rebuild with leading indentation', () => {
        const firstElement = new JsonPrimitiveNode({
            location: SourceLocation.unknown(),
            children: [
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.NUMBER,
                    value: '1',
                }),
            ],
            token: new JsonTokenNode({
                location: SourceLocation.unknown(),
                type: JsonTokenType.NUMBER,
                value: '1',
            }),
            value: 1,
        });

        const secondElement = new JsonPrimitiveNode({
            location: SourceLocation.unknown(),
            children: [
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.NUMBER,
                    value: '2',
                }),
            ],
            token: new JsonTokenNode({
                location: SourceLocation.unknown(),
                type: JsonTokenType.NUMBER,
                value: '2',
            }),
            value: 2,
        });

        const thirdElement = new JsonPrimitiveNode({
            location: SourceLocation.unknown(),
            children: [
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.NUMBER,
                    value: '3',
                }),
            ],
            token: new JsonTokenNode({
                location: SourceLocation.unknown(),
                type: JsonTokenType.NUMBER,
                value: '3',
            }),
            value: 3,
        });

        const arrayNode = new JsonArrayNode({
            location: SourceLocation.unknown(),
            children: [
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BRACKET_LEFT,
                    value: '[',
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.NEWLINE,
                    value: '\n',
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.WHITESPACE,
                    value: ' ',
                }),
                firstElement,
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.COMMA,
                    value: ',',
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.NEWLINE,
                    value: '\n',
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.WHITESPACE,
                    value: ' ',
                }),
                thirdElement,
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.NEWLINE,
                    value: '\n',
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BRACKET_RIGHT,
                    value: ']',
                }),
            ],
            elements: [firstElement, secondElement, thirdElement],
        });

        const property = new JsonPropertyNode({
            location: SourceLocation.unknown(),
            children: [],
            key: JsonIdentifierNode.of('foo'),
            value: arrayNode,
        });

        const structureNode = new TestStructureNode({
            location: SourceLocation.unknown(),
            children: [
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                }),
                property,
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                }),
            ],
            properties: [property],
        });

        structureNode.rebuild({
            object: {
                leadingIndentation: true,
                indentationSize: 4,
            },
        });

        expect(structureNode).toStrictEqual(new TestStructureNode({
            location: SourceLocation.unknown(),
            children: [
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.NEWLINE,
                    value: '\n',
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.WHITESPACE,
                    value: '    ',
                }),
                new JsonPropertyNode({
                    location: SourceLocation.unknown(),
                    children: [
                        new JsonIdentifierNode({
                            location: SourceLocation.unknown(),
                            children: [
                                new JsonTokenNode({
                                    location: SourceLocation.unknown(),
                                    type: JsonTokenType.IDENTIFIER,
                                    value: 'foo',
                                }),
                            ],
                            token: new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.IDENTIFIER,
                                value: 'foo',
                            }),
                        }),
                        new JsonTokenNode({
                            location: SourceLocation.unknown(),
                            type: JsonTokenType.COLON,
                            value: ':',
                        }),
                        new JsonArrayNode({
                            location: SourceLocation.unknown(),
                            children: [
                                new JsonTokenNode({
                                    location: SourceLocation.unknown(),
                                    type: JsonTokenType.BRACKET_LEFT,
                                    value: '[',
                                }),
                                new JsonTokenNode({
                                    location: SourceLocation.unknown(),
                                    type: JsonTokenType.NEWLINE,
                                    value: '\n',
                                }),
                                new JsonTokenNode({
                                    location: SourceLocation.unknown(),
                                    type: JsonTokenType.WHITESPACE,
                                    value: ' ',
                                }),
                                firstElement,
                                new JsonTokenNode({
                                    location: SourceLocation.unknown(),
                                    type: JsonTokenType.COMMA,
                                    value: ',',
                                }),
                                new JsonTokenNode({
                                    location: SourceLocation.unknown(),
                                    type: JsonTokenType.NEWLINE,
                                    value: '\n',
                                }),
                                new JsonTokenNode({
                                    location: SourceLocation.unknown(),
                                    type: JsonTokenType.WHITESPACE,
                                    value: ' ',
                                }),
                                secondElement,
                                new JsonTokenNode({
                                    location: SourceLocation.unknown(),
                                    type: JsonTokenType.COMMA,
                                    value: ',',
                                }),
                                new JsonTokenNode({
                                    location: SourceLocation.unknown(),
                                    type: JsonTokenType.NEWLINE,
                                    value: '\n',
                                }),
                                new JsonTokenNode({
                                    location: SourceLocation.unknown(),
                                    type: JsonTokenType.WHITESPACE,
                                    value: '  ',
                                }),
                                thirdElement,
                                new JsonTokenNode({
                                    location: SourceLocation.unknown(),
                                    type: JsonTokenType.NEWLINE,
                                    value: '\n',
                                }),
                                new JsonTokenNode({
                                    location: SourceLocation.unknown(),
                                    type: JsonTokenType.WHITESPACE,
                                    value: ' ',
                                }),
                                new JsonTokenNode({
                                    location: SourceLocation.unknown(),
                                    type: JsonTokenType.BRACKET_RIGHT,
                                    value: ']',
                                }),
                            ],
                            elements: [firstElement, secondElement, thirdElement],
                        }),
                    ],
                    key: new JsonIdentifierNode({
                        location: SourceLocation.unknown(),
                        children: [
                            new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.IDENTIFIER,
                                value: 'foo',
                            }),
                        ],
                        token: new JsonTokenNode({
                            location: SourceLocation.unknown(),
                            type: JsonTokenType.IDENTIFIER,
                            value: 'foo',
                        }),
                    }),
                    value: new JsonArrayNode({
                        location: SourceLocation.unknown(),
                        children: [
                            new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.BRACKET_LEFT,
                                value: '[',
                            }),
                            new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.NEWLINE,
                                value: '\n',
                            }),
                            new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.WHITESPACE,
                                value: ' ',
                            }),
                            firstElement,
                            new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.COMMA,
                                value: ',',
                            }),
                            new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.NEWLINE,
                                value: '\n',
                            }),
                            new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.WHITESPACE,
                                value: ' ',
                            }),
                            secondElement,
                            new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.COMMA,
                                value: ',',
                            }),
                            new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.NEWLINE,
                                value: '\n',
                            }),
                            new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.WHITESPACE,
                                value: '  ',
                            }),
                            thirdElement,
                            new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.NEWLINE,
                                value: '\n',
                            }),
                            new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.WHITESPACE,
                                value: ' ',
                            }),
                            new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.BRACKET_RIGHT,
                                value: ']',
                            }),
                        ],
                        elements: [firstElement, secondElement, thirdElement],
                    }),
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                }),
            ],
            properties: [property],
        }));
    });

    it('should rebuild with trailing indentation', () => {
        const property = new JsonPropertyNode({
            location: SourceLocation.unknown(),
            children: [],
            key: JsonIdentifierNode.of('foo'),
            value: JsonPrimitiveNode.of('bar'),
        });

        const structureNode = new TestStructureNode({
            location: SourceLocation.unknown(),
            children: [
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                }),
            ],
            properties: [property],
        });

        structureNode.rebuild({
            object: {
                trailingIndentation: true,
                indentationSize: 4,
            },
        });

        expect(structureNode).toStrictEqual(new TestStructureNode({
            location: SourceLocation.unknown(),
            children: [
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                }),
                new JsonPropertyNode({
                    location: SourceLocation.unknown(),
                    children: [
                        new JsonIdentifierNode({
                            location: SourceLocation.unknown(),
                            children: [
                                new JsonTokenNode({
                                    location: SourceLocation.unknown(),
                                    type: JsonTokenType.IDENTIFIER,
                                    value: 'foo',
                                }),
                            ],
                            token: new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.IDENTIFIER,
                                value: 'foo',
                            }),
                        }),
                        new JsonTokenNode({
                            location: SourceLocation.unknown(),
                            type: JsonTokenType.COLON,
                            value: ':',
                        }),
                        new JsonPrimitiveNode({
                            location: SourceLocation.unknown(),
                            children: [
                                new JsonTokenNode({
                                    location: SourceLocation.unknown(),
                                    type: JsonTokenType.STRING,
                                    value: '"bar"',
                                }),
                            ],
                            token: new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.STRING,
                                value: '"bar"',
                            }),
                            value: 'bar',
                        }),
                    ],
                    key: new JsonIdentifierNode({
                        location: SourceLocation.unknown(),
                        children: [
                            new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.IDENTIFIER,
                                value: 'foo',
                            }),
                        ],
                        token: new JsonTokenNode({
                            location: SourceLocation.unknown(),
                            type: JsonTokenType.IDENTIFIER,
                            value: 'foo',
                        }),
                    }),
                    value: new JsonPrimitiveNode({
                        location: SourceLocation.unknown(),
                        children: [
                            new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.STRING,
                                value: '"bar"',
                            }),
                        ],
                        token: new JsonTokenNode({
                            location: SourceLocation.unknown(),
                            type: JsonTokenType.STRING,
                            value: '"bar"',
                        }),
                        value: 'bar',
                    }),
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.NEWLINE,
                    value: '\n',
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.WHITESPACE,
                    value: '',
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                }),
            ],
            properties: [property],
        }));
    });

    it('should rebuild with trailing comma', () => {
        const property = new JsonPropertyNode({
            location: SourceLocation.unknown(),
            children: [],
            key: JsonIdentifierNode.of('foo'),
            value: JsonPrimitiveNode.of('bar'),
        });

        const structureNode = new TestStructureNode({
            location: SourceLocation.unknown(),
            children: [
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                }),
            ],
            properties: [property],
        });

        structureNode.rebuild({
            object: {
                trailingComma: true,
            },
        });

        expect(structureNode).toStrictEqual(new TestStructureNode({
            location: SourceLocation.unknown(),
            children: [
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                }),
                new JsonPropertyNode({
                    location: SourceLocation.unknown(),
                    children: [
                        new JsonIdentifierNode({
                            location: SourceLocation.unknown(),
                            children: [
                                new JsonTokenNode({
                                    location: SourceLocation.unknown(),
                                    type: JsonTokenType.IDENTIFIER,
                                    value: 'foo',
                                }),
                            ],
                            token: new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.IDENTIFIER,
                                value: 'foo',
                            }),
                        }),
                        new JsonTokenNode({
                            location: SourceLocation.unknown(),
                            type: JsonTokenType.COLON,
                            value: ':',
                        }),
                        new JsonPrimitiveNode({
                            location: SourceLocation.unknown(),
                            children: [
                                new JsonTokenNode({
                                    location: SourceLocation.unknown(),
                                    type: JsonTokenType.STRING,
                                    value: '"bar"',
                                }),
                            ],
                            token: new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.STRING,
                                value: '"bar"',
                            }),
                            value: 'bar',
                        }),
                    ],
                    key: new JsonIdentifierNode({
                        location: SourceLocation.unknown(),
                        children: [
                            new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.IDENTIFIER,
                                value: 'foo',
                            }),
                        ],
                        token: new JsonTokenNode({
                            location: SourceLocation.unknown(),
                            type: JsonTokenType.IDENTIFIER,
                            value: 'foo',
                        }),
                    }),
                    value: new JsonPrimitiveNode({
                        location: SourceLocation.unknown(),
                        children: [
                            new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.STRING,
                                value: '"bar"',
                            }),
                        ],
                        token: new JsonTokenNode({
                            location: SourceLocation.unknown(),
                            type: JsonTokenType.STRING,
                            value: '"bar"',
                        }),
                        value: 'bar',
                    }),
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.COMMA,
                    value: ',',
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                }),
            ],
            properties: [property],
        }));
    });

    it('should rebuild with block comment', () => {
        const property = new JsonPropertyNode({
            location: SourceLocation.unknown(),
            children: [],
            key: JsonIdentifierNode.of('foo'),
            value: JsonPrimitiveNode.of('bar'),
        });

        const structureNode = new TestStructureNode({
            location: SourceLocation.unknown(),
            children: [
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.WHITESPACE,
                    value: ' ',
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BLOCK_COMMENT,
                    value: '/* comment */',
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                }),
            ],
            properties: [property],
        });

        structureNode.rebuild({});

        expect(structureNode).toStrictEqual(new TestStructureNode({
            location: SourceLocation.unknown(),
            children: [
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.WHITESPACE,
                    value: ' ',
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BLOCK_COMMENT,
                    value: '/* comment */',
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.WHITESPACE,
                    value: ' ',
                }),
                new JsonPropertyNode({
                    location: SourceLocation.unknown(),
                    children: [
                        new JsonIdentifierNode({
                            location: SourceLocation.unknown(),
                            children: [
                                new JsonTokenNode({
                                    location: SourceLocation.unknown(),
                                    type: JsonTokenType.IDENTIFIER,
                                    value: 'foo',
                                }),
                            ],
                            token: new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.IDENTIFIER,
                                value: 'foo',
                            }),
                        }),
                        new JsonTokenNode({
                            location: SourceLocation.unknown(),
                            type: JsonTokenType.COLON,
                            value: ':',
                        }),
                        new JsonPrimitiveNode({
                            location: SourceLocation.unknown(),
                            children: [
                                new JsonTokenNode({
                                    location: SourceLocation.unknown(),
                                    type: JsonTokenType.STRING,
                                    value: '"bar"',
                                }),
                            ],
                            token: new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.STRING,
                                value: '"bar"',
                            }),
                            value: 'bar',
                        }),
                    ],
                    key: new JsonIdentifierNode({
                        location: SourceLocation.unknown(),
                        children: [
                            new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.IDENTIFIER,
                                value: 'foo',
                            }),
                        ],
                        token: new JsonTokenNode({
                            location: SourceLocation.unknown(),
                            type: JsonTokenType.IDENTIFIER,
                            value: 'foo',
                        }),
                    }),
                    value: new JsonPrimitiveNode({
                        location: SourceLocation.unknown(),
                        children: [
                            new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.STRING,
                                value: '"bar"',
                            }),
                        ],
                        token: new JsonTokenNode({
                            location: SourceLocation.unknown(),
                            type: JsonTokenType.STRING,
                            value: '"bar"',
                        }),
                        value: 'bar',
                    }),
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                }),
            ],
            properties: [property],
        }));
    });

    it('should rebuild with string key', () => {
        const property = new JsonPropertyNode({
            location: SourceLocation.unknown(),
            children: [
                new JsonPrimitiveNode({
                    location: SourceLocation.unknown(),
                    children: [
                        new JsonTokenNode({
                            location: SourceLocation.unknown(),
                            type: JsonTokenType.STRING,
                            value: '"foo"',
                        }),
                    ],
                    token: new JsonTokenNode({
                        location: SourceLocation.unknown(),
                        type: JsonTokenType.STRING,
                        value: '"foo"',
                    }),
                    value: 'foo',
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.COLON,
                    value: new JsonPrimitiveNode({
                        location: SourceLocation.unknown(),
                        children: [
                            new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.STRING,
                                value: 'foo',
                            }),
                        ],
                        token: new JsonTokenNode({
                            location: SourceLocation.unknown(),
                            type: JsonTokenType.STRING,
                            value: 'foo',
                        }),
                        value: 'foo',
                    }),
                }),
            ],
            key: new JsonPrimitiveNode({
                location: SourceLocation.unknown(),
                children: [
                    new JsonTokenNode({
                        location: SourceLocation.unknown(),
                        type: JsonTokenType.STRING,
                        value: '"foo"',
                    }),
                ],
                token: new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.STRING,
                    value: '"foo"',
                }),
                value: '"foo"',
            }),
            value: new JsonPrimitiveNode({
                location: SourceLocation.unknown(),
                children: [
                    new JsonTokenNode({
                        location: SourceLocation.unknown(),
                        type: JsonTokenType.STRING,
                        value: '"bar"',
                    }),
                ],
                token: new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.STRING,
                    value: '"bar"',
                }),
                value: '"bar"',
            }),
        });

        const structureNode = new TestStructureNode({
            location: SourceLocation.unknown(),
            children: [
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.NEWLINE,
                    value: '\n',
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.WHITESPACE,
                    value: ' ',
                }),
                property,
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.COMMA,
                    value: ',',
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.NEWLINE,
                    value: '\n',
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                }),
            ],
            properties: [property],
        });

        structureNode.rebuild({
            object: {
                entryIndentation: true,
            },
        });

        expect(structureNode).toStrictEqual(new TestStructureNode({
            location: SourceLocation.unknown(),
            children: [
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                }),
                new JsonPropertyNode({
                    location: SourceLocation.unknown(),
                    children: [
                        new JsonPrimitiveNode({
                            location: SourceLocation.unknown(),
                            children: [
                                new JsonTokenNode({
                                    location: SourceLocation.unknown(),
                                    type: JsonTokenType.STRING,
                                    value: '"foo"',
                                }),
                            ],
                            token: new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.STRING,
                                value: '"foo"',
                            }),
                            value: 'foo',
                        }),
                        new JsonTokenNode({
                            location: SourceLocation.unknown(),
                            type: JsonTokenType.COLON,
                            value: ':',
                        }),
                        new JsonPrimitiveNode({
                            location: SourceLocation.unknown(),
                            children: [
                                new JsonTokenNode({
                                    location: SourceLocation.unknown(),
                                    type: JsonTokenType.STRING,
                                    value: '"bar"',
                                }),
                            ],
                            token: new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.STRING,
                                value: '"bar"',
                            }),
                            value: 'bar',
                        }),
                    ],
                    key: new JsonPrimitiveNode({
                        location: SourceLocation.unknown(),
                        children: [
                            new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.STRING,
                                value: '"foo"',
                            }),
                        ],
                        token: new JsonTokenNode({
                            location: SourceLocation.unknown(),
                            type: JsonTokenType.STRING,
                            value: '"foo"',
                        }),
                        value: 'foo',
                    }),
                    value: new JsonPrimitiveNode({
                        location: SourceLocation.unknown(),
                        children: [
                            new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.STRING,
                                value: '"bar"',
                            }),
                        ],
                        token: new JsonTokenNode({
                            location: SourceLocation.unknown(),
                            type: JsonTokenType.STRING,
                            value: '"bar"',
                        }),
                        value: 'bar',
                    }),
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                }),
            ],
            properties: [property],
        }));
    });

    it('should rebuild with nested structure node', () => {
        const property = new JsonPropertyNode({
            location: SourceLocation.unknown(),
            children: [],
            key: JsonIdentifierNode.of('foo'),
            value: JsonPrimitiveNode.of('bar'),
        });

        const structureNode = new TestStructureNode({
            location: SourceLocation.unknown(),
            children: [
                property,
                new TestStructureNode({
                    location: SourceLocation.unknown(),
                    children: [property],
                    properties: [],
                }),
            ],
            properties: [property],
        });

        structureNode.rebuild({
            object: {
                entryIndentation: true,
            },
        });

        expect(structureNode).toStrictEqual(new TestStructureNode({
            location: SourceLocation.unknown(),
            children: [
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                }),
                new JsonPropertyNode({
                    location: SourceLocation.unknown(),
                    children: [
                        new JsonIdentifierNode({
                            location: SourceLocation.unknown(),
                            children: [
                                new JsonTokenNode({
                                    location: SourceLocation.unknown(),
                                    type: JsonTokenType.IDENTIFIER,
                                    value: 'foo',
                                }),
                            ],
                            token: new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.IDENTIFIER,
                                value: 'foo',
                            }),
                        }),
                        new JsonTokenNode({
                            location: SourceLocation.unknown(),
                            type: JsonTokenType.COLON,
                            value: ':',
                        }),
                        new JsonPrimitiveNode({
                            location: SourceLocation.unknown(),
                            children: [
                                new JsonTokenNode({
                                    location: SourceLocation.unknown(),
                                    type: JsonTokenType.STRING,
                                    value: '"bar"',
                                }),
                            ],
                            token: new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.STRING,
                                value: '"bar"',
                            }),
                            value: 'bar',
                        }),
                    ],
                    key: new JsonIdentifierNode({
                        location: SourceLocation.unknown(),
                        children: [
                            new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.IDENTIFIER,
                                value: 'foo',
                            }),
                        ],
                        token: new JsonTokenNode({
                            location: SourceLocation.unknown(),
                            type: JsonTokenType.IDENTIFIER,
                            value: 'foo',
                        }),
                    }),
                    value: new JsonPrimitiveNode({
                        location: SourceLocation.unknown(),
                        children: [
                            new JsonTokenNode({
                                location: SourceLocation.unknown(),
                                type: JsonTokenType.STRING,
                                value: '"bar"',
                            }),
                        ],
                        token: new JsonTokenNode({
                            location: SourceLocation.unknown(),
                            type: JsonTokenType.STRING,
                            value: '"bar"',
                        }),
                        value: 'bar',
                    }),
                }),
                new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                }),
            ],
            properties: [property],
        }));
    });
});
