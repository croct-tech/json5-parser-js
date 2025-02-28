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

        public clone(): TestStructureNode {
            const clones = new Map<JsonPropertyNode, JsonPropertyNode>();

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

    it('should rebuild with a given indentation size', () => {
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
                indentationSize: 4,
                leadingIndentation: true,
            },
        });

        expect(structureNode.toString()).toBe('{foo:"bar"}');
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

        expect(structureNode).toStrictEqual(new TestStructureNode({
            children: [
                new JsonTokenNode({
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                }),
                new JsonPropertyNode({
                    children: [
                        new JsonIdentifierNode({
                            children: [
                                new JsonTokenNode({
                                    type: JsonTokenType.IDENTIFIER,
                                    value: 'foo',
                                }),
                            ],
                            token: new JsonTokenNode({
                                type: JsonTokenType.IDENTIFIER,
                                value: 'foo',
                            }),
                        }),
                        new JsonTokenNode({
                            type: JsonTokenType.COLON,
                            value: ':',
                        }),
                        new JsonTokenNode({
                            type: JsonTokenType.WHITESPACE,
                            value: ' ',
                        }),
                        new JsonPrimitiveNode({
                            children: [
                                new JsonTokenNode({
                                    type: JsonTokenType.STRING,
                                    value: '"bar"',
                                }),
                            ],
                            token: new JsonTokenNode({
                                type: JsonTokenType.STRING,
                                value: '"bar"',
                            }),
                            value: 'bar',
                        }),
                    ],
                    key: new JsonIdentifierNode({
                        children: [
                            new JsonTokenNode({
                                type: JsonTokenType.IDENTIFIER,
                                value: 'foo',
                            }),
                        ],
                        token: new JsonTokenNode({
                            type: JsonTokenType.IDENTIFIER,
                            value: 'foo',
                        }),
                    }),
                    value: new JsonPrimitiveNode({
                        children: [
                            new JsonTokenNode({
                                type: JsonTokenType.STRING,
                                value: '"bar"',
                            }),
                        ],
                        token: new JsonTokenNode({
                            type: JsonTokenType.STRING,
                            value: '"bar"',
                        }),
                        value: 'bar',
                    }),
                }),
                new JsonTokenNode({
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                }),
            ],
            properties: [property],
        }));
    });

    it('should rebuild with entry indentation', () => {
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
                entryIndentation: true,
            },
        });

        expect(structureNode).toStrictEqual(new TestStructureNode({
            children: [
                new JsonTokenNode({
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                }),
                new JsonPropertyNode({
                    children: [
                        new JsonIdentifierNode({
                            children: [
                                new JsonTokenNode({
                                    type: JsonTokenType.IDENTIFIER,
                                    value: 'foo',
                                }),
                            ],
                            token: new JsonTokenNode({
                                type: JsonTokenType.IDENTIFIER,
                                value: 'foo',
                            }),
                        }),
                        new JsonTokenNode({
                            type: JsonTokenType.COLON,
                            value: ':',
                        }),
                        new JsonPrimitiveNode({
                            children: [
                                new JsonTokenNode({
                                    type: JsonTokenType.STRING,
                                    value: '"bar"',
                                }),
                            ],
                            token: new JsonTokenNode({
                                type: JsonTokenType.STRING,
                                value: '"bar"',
                            }),
                            value: 'bar',
                        }),
                    ],
                    key: new JsonIdentifierNode({
                        children: [
                            new JsonTokenNode({
                                type: JsonTokenType.IDENTIFIER,
                                value: 'foo',
                            }),
                        ],
                        token: new JsonTokenNode({
                            type: JsonTokenType.IDENTIFIER,
                            value: 'foo',
                        }),
                    }),
                    value: new JsonPrimitiveNode({
                        children: [
                            new JsonTokenNode({
                                type: JsonTokenType.STRING,
                                value: '"bar"',
                            }),
                        ],
                        token: new JsonTokenNode({
                            type: JsonTokenType.STRING,
                            value: '"bar"',
                        }),
                        value: 'bar',
                    }),
                }),
                new JsonTokenNode({
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                }),
            ],
            properties: [property],
        }));
    });

    it('should rebuild with leading indentation', () => {
        const firstElement = new JsonPrimitiveNode({
            children: [
                new JsonTokenNode({
                    type: JsonTokenType.NUMBER,
                    value: '1',
                }),
            ],
            token: new JsonTokenNode({
                type: JsonTokenType.NUMBER,
                value: '1',
            }),
            value: 1,
        });

        const secondElement = new JsonPrimitiveNode({
            children: [
                new JsonTokenNode({
                    type: JsonTokenType.NUMBER,
                    value: '2',
                }),
            ],
            token: new JsonTokenNode({
                type: JsonTokenType.NUMBER,
                value: '2',
            }),
            value: 2,
        });

        const thirdElement = new JsonPrimitiveNode({
            children: [
                new JsonTokenNode({
                    type: JsonTokenType.NUMBER,
                    value: '3',
                }),
            ],
            token: new JsonTokenNode({
                type: JsonTokenType.NUMBER,
                value: '3',
            }),
            value: 3,
        });

        const arrayNode = new JsonArrayNode({
            children: [
                new JsonTokenNode({
                    type: JsonTokenType.BRACKET_LEFT,
                    value: '[',
                }),
                new JsonTokenNode({
                    type: JsonTokenType.NEWLINE,
                    value: '\n',
                }),
                new JsonTokenNode({
                    type: JsonTokenType.WHITESPACE,
                    value: ' ',
                }),
                firstElement,
                new JsonTokenNode({
                    type: JsonTokenType.COMMA,
                    value: ',',
                }),
                new JsonTokenNode({
                    type: JsonTokenType.NEWLINE,
                    value: '\n',
                }),
                new JsonTokenNode({
                    type: JsonTokenType.WHITESPACE,
                    value: ' ',
                }),
                thirdElement,
                new JsonTokenNode({
                    type: JsonTokenType.NEWLINE,
                    value: '\n',
                }),
                new JsonTokenNode({
                    type: JsonTokenType.BRACKET_RIGHT,
                    value: ']',
                }),
            ],
            elements: [firstElement, secondElement, thirdElement],
        });

        const property = new JsonPropertyNode({
            children: [],
            key: JsonIdentifierNode.of('foo'),
            value: arrayNode,
        });

        const structureNode = new TestStructureNode({
            children: [
                new JsonTokenNode({
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                }),
                property,
                new JsonTokenNode({
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
            children: [
                new JsonTokenNode({
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                }),
                new JsonTokenNode({
                    type: JsonTokenType.NEWLINE,
                    value: '\n',
                }),
                new JsonTokenNode({
                    type: JsonTokenType.WHITESPACE,
                    value: '    ',
                }),
                new JsonPropertyNode({
                    children: [
                        new JsonIdentifierNode({
                            children: [
                                new JsonTokenNode({
                                    type: JsonTokenType.IDENTIFIER,
                                    value: 'foo',
                                }),
                            ],
                            token: new JsonTokenNode({
                                type: JsonTokenType.IDENTIFIER,
                                value: 'foo',
                            }),
                        }),
                        new JsonTokenNode({
                            type: JsonTokenType.COLON,
                            value: ':',
                        }),
                        new JsonArrayNode({
                            children: [
                                new JsonTokenNode({
                                    type: JsonTokenType.BRACKET_LEFT,
                                    value: '[',
                                }),
                                new JsonTokenNode({
                                    type: JsonTokenType.NEWLINE,
                                    value: '\n',
                                }),
                                new JsonTokenNode({
                                    type: JsonTokenType.WHITESPACE,
                                    value: ' ',
                                }),
                                firstElement,
                                new JsonTokenNode({
                                    type: JsonTokenType.COMMA,
                                    value: ',',
                                }),
                                new JsonTokenNode({
                                    type: JsonTokenType.NEWLINE,
                                    value: '\n',
                                }),
                                new JsonTokenNode({
                                    type: JsonTokenType.WHITESPACE,
                                    value: ' ',
                                }),
                                secondElement,
                                new JsonTokenNode({
                                    type: JsonTokenType.COMMA,
                                    value: ',',
                                }),
                                new JsonTokenNode({
                                    type: JsonTokenType.NEWLINE,
                                    value: '\n',
                                }),
                                new JsonTokenNode({
                                    type: JsonTokenType.WHITESPACE,
                                    value: '  ',
                                }),
                                thirdElement,
                                new JsonTokenNode({
                                    type: JsonTokenType.NEWLINE,
                                    value: '\n',
                                }),
                                new JsonTokenNode({
                                    type: JsonTokenType.WHITESPACE,
                                    value: ' ',
                                }),
                                new JsonTokenNode({
                                    type: JsonTokenType.BRACKET_RIGHT,
                                    value: ']',
                                }),
                            ],
                            elements: [firstElement, secondElement, thirdElement],
                        }),
                    ],
                    key: new JsonIdentifierNode({
                        children: [
                            new JsonTokenNode({
                                type: JsonTokenType.IDENTIFIER,
                                value: 'foo',
                            }),
                        ],
                        token: new JsonTokenNode({
                            type: JsonTokenType.IDENTIFIER,
                            value: 'foo',
                        }),
                    }),
                    value: new JsonArrayNode({
                        children: [
                            new JsonTokenNode({
                                type: JsonTokenType.BRACKET_LEFT,
                                value: '[',
                            }),
                            new JsonTokenNode({
                                type: JsonTokenType.NEWLINE,
                                value: '\n',
                            }),
                            new JsonTokenNode({
                                type: JsonTokenType.WHITESPACE,
                                value: ' ',
                            }),
                            firstElement,
                            new JsonTokenNode({
                                type: JsonTokenType.COMMA,
                                value: ',',
                            }),
                            new JsonTokenNode({
                                type: JsonTokenType.NEWLINE,
                                value: '\n',
                            }),
                            new JsonTokenNode({
                                type: JsonTokenType.WHITESPACE,
                                value: ' ',
                            }),
                            secondElement,
                            new JsonTokenNode({
                                type: JsonTokenType.COMMA,
                                value: ',',
                            }),
                            new JsonTokenNode({
                                type: JsonTokenType.NEWLINE,
                                value: '\n',
                            }),
                            new JsonTokenNode({
                                type: JsonTokenType.WHITESPACE,
                                value: '  ',
                            }),
                            thirdElement,
                            new JsonTokenNode({
                                type: JsonTokenType.NEWLINE,
                                value: '\n',
                            }),
                            new JsonTokenNode({
                                type: JsonTokenType.WHITESPACE,
                                value: ' ',
                            }),
                            new JsonTokenNode({
                                type: JsonTokenType.BRACKET_RIGHT,
                                value: ']',
                            }),
                        ],
                        elements: [firstElement, secondElement, thirdElement],
                    }),
                }),
                new JsonTokenNode({
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                }),
            ],
            properties: [property],
        }));
    });

    it('should rebuild with trailing indentation', () => {
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
                trailingIndentation: true,
                indentationSize: 4,
            },
        });

        expect(structureNode).toStrictEqual(new TestStructureNode({
            children: [
                new JsonTokenNode({
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                }),
                new JsonPropertyNode({
                    children: [
                        new JsonIdentifierNode({
                            children: [
                                new JsonTokenNode({
                                    type: JsonTokenType.IDENTIFIER,
                                    value: 'foo',
                                }),
                            ],
                            token: new JsonTokenNode({
                                type: JsonTokenType.IDENTIFIER,
                                value: 'foo',
                            }),
                        }),
                        new JsonTokenNode({
                            type: JsonTokenType.COLON,
                            value: ':',
                        }),
                        new JsonPrimitiveNode({
                            children: [
                                new JsonTokenNode({
                                    type: JsonTokenType.STRING,
                                    value: '"bar"',
                                }),
                            ],
                            token: new JsonTokenNode({
                                type: JsonTokenType.STRING,
                                value: '"bar"',
                            }),
                            value: 'bar',
                        }),
                    ],
                    key: new JsonIdentifierNode({
                        children: [
                            new JsonTokenNode({
                                type: JsonTokenType.IDENTIFIER,
                                value: 'foo',
                            }),
                        ],
                        token: new JsonTokenNode({
                            type: JsonTokenType.IDENTIFIER,
                            value: 'foo',
                        }),
                    }),
                    value: new JsonPrimitiveNode({
                        children: [
                            new JsonTokenNode({
                                type: JsonTokenType.STRING,
                                value: '"bar"',
                            }),
                        ],
                        token: new JsonTokenNode({
                            type: JsonTokenType.STRING,
                            value: '"bar"',
                        }),
                        value: 'bar',
                    }),
                }),
                new JsonTokenNode({
                    type: JsonTokenType.NEWLINE,
                    value: '\n',
                }),
                new JsonTokenNode({
                    type: JsonTokenType.WHITESPACE,
                    value: '',
                }),
                new JsonTokenNode({
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                }),
            ],
            properties: [property],
        }));
    });

    it('should rebuild with trailing comma', () => {
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
                trailingComma: true,
            },
        });

        expect(structureNode).toStrictEqual(new TestStructureNode({
            children: [
                new JsonTokenNode({
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                }),
                new JsonPropertyNode({
                    children: [
                        new JsonIdentifierNode({
                            children: [
                                new JsonTokenNode({
                                    type: JsonTokenType.IDENTIFIER,
                                    value: 'foo',
                                }),
                            ],
                            token: new JsonTokenNode({
                                type: JsonTokenType.IDENTIFIER,
                                value: 'foo',
                            }),
                        }),
                        new JsonTokenNode({
                            type: JsonTokenType.COLON,
                            value: ':',
                        }),
                        new JsonPrimitiveNode({
                            children: [
                                new JsonTokenNode({
                                    type: JsonTokenType.STRING,
                                    value: '"bar"',
                                }),
                            ],
                            token: new JsonTokenNode({
                                type: JsonTokenType.STRING,
                                value: '"bar"',
                            }),
                            value: 'bar',
                        }),
                    ],
                    key: new JsonIdentifierNode({
                        children: [
                            new JsonTokenNode({
                                type: JsonTokenType.IDENTIFIER,
                                value: 'foo',
                            }),
                        ],
                        token: new JsonTokenNode({
                            type: JsonTokenType.IDENTIFIER,
                            value: 'foo',
                        }),
                    }),
                    value: new JsonPrimitiveNode({
                        children: [
                            new JsonTokenNode({
                                type: JsonTokenType.STRING,
                                value: '"bar"',
                            }),
                        ],
                        token: new JsonTokenNode({
                            type: JsonTokenType.STRING,
                            value: '"bar"',
                        }),
                        value: 'bar',
                    }),
                }),
                new JsonTokenNode({
                    type: JsonTokenType.COMMA,
                    value: ',',
                }),
                new JsonTokenNode({
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                }),
            ],
            properties: [property],
        }));
    });

    it('should rebuild with block comment', () => {
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
                    type: JsonTokenType.WHITESPACE,
                    value: ' ',
                }),
                new JsonTokenNode({
                    type: JsonTokenType.BLOCK_COMMENT,
                    value: '/* comment */',
                }),
                new JsonTokenNode({
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                }),
            ],
            properties: [property],
        });

        structureNode.rebuild({});

        expect(structureNode).toStrictEqual(new TestStructureNode({
            children: [
                new JsonTokenNode({
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                }),
                new JsonTokenNode({
                    type: JsonTokenType.WHITESPACE,
                    value: ' ',
                }),
                new JsonTokenNode({
                    type: JsonTokenType.BLOCK_COMMENT,
                    value: '/* comment */',
                }),
                new JsonTokenNode({
                    type: JsonTokenType.WHITESPACE,
                    value: ' ',
                }),
                new JsonPropertyNode({
                    children: [
                        new JsonIdentifierNode({
                            children: [
                                new JsonTokenNode({
                                    type: JsonTokenType.IDENTIFIER,
                                    value: 'foo',
                                }),
                            ],
                            token: new JsonTokenNode({
                                type: JsonTokenType.IDENTIFIER,
                                value: 'foo',
                            }),
                        }),
                        new JsonTokenNode({
                            type: JsonTokenType.COLON,
                            value: ':',
                        }),
                        new JsonPrimitiveNode({
                            children: [
                                new JsonTokenNode({
                                    type: JsonTokenType.STRING,
                                    value: '"bar"',
                                }),
                            ],
                            token: new JsonTokenNode({
                                type: JsonTokenType.STRING,
                                value: '"bar"',
                            }),
                            value: 'bar',
                        }),
                    ],
                    key: new JsonIdentifierNode({
                        children: [
                            new JsonTokenNode({
                                type: JsonTokenType.IDENTIFIER,
                                value: 'foo',
                            }),
                        ],
                        token: new JsonTokenNode({
                            type: JsonTokenType.IDENTIFIER,
                            value: 'foo',
                        }),
                    }),
                    value: new JsonPrimitiveNode({
                        children: [
                            new JsonTokenNode({
                                type: JsonTokenType.STRING,
                                value: '"bar"',
                            }),
                        ],
                        token: new JsonTokenNode({
                            type: JsonTokenType.STRING,
                            value: '"bar"',
                        }),
                        value: 'bar',
                    }),
                }),
                new JsonTokenNode({
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                }),
            ],
            properties: [property],
        }));
    });

    it('should rebuild with string key', () => {
        const property = new JsonPropertyNode({
            children: [
                new JsonPrimitiveNode({
                    children: [
                        new JsonTokenNode({
                            type: JsonTokenType.STRING,
                            value: '"foo"',
                        }),
                    ],
                    token: new JsonTokenNode({
                        type: JsonTokenType.STRING,
                        value: '"foo"',
                    }),
                    value: 'foo',
                }),
                new JsonPrimitiveNode({
                    children: [
                        new JsonTokenNode({
                            type: JsonTokenType.STRING,
                            value: 'foo',
                        }),
                    ],
                    token: new JsonTokenNode({
                        type: JsonTokenType.STRING,
                        value: 'foo',
                    }),
                    value: 'foo',
                }),
            ],
            key: new JsonPrimitiveNode({
                children: [
                    new JsonTokenNode({
                        type: JsonTokenType.STRING,
                        value: '"foo"',
                    }),
                ],
                token: new JsonTokenNode({
                    type: JsonTokenType.STRING,
                    value: '"foo"',
                }),
                value: '"foo"',
            }),
            value: new JsonPrimitiveNode({
                children: [
                    new JsonTokenNode({
                        type: JsonTokenType.STRING,
                        value: '"bar"',
                    }),
                ],
                token: new JsonTokenNode({
                    type: JsonTokenType.STRING,
                    value: '"bar"',
                }),
                value: '"bar"',
            }),
        });

        const structureNode = new TestStructureNode({
            children: [
                new JsonTokenNode({
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                }),
                new JsonTokenNode({
                    type: JsonTokenType.NEWLINE,
                    value: '\n',
                }),
                new JsonTokenNode({
                    type: JsonTokenType.WHITESPACE,
                    value: ' ',
                }),
                property,
                new JsonTokenNode({
                    type: JsonTokenType.NEWLINE,
                    value: '\n',
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
                entryIndentation: true,
            },
        });

        expect(structureNode).toStrictEqual(new TestStructureNode({
            children: [
                new JsonTokenNode({
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                }),
                new JsonTokenNode({
                    type: JsonTokenType.NEWLINE,
                    value: '\n',
                }),
                new JsonTokenNode({
                    type: JsonTokenType.WHITESPACE,
                    value: ' ',
                }),
                new JsonPropertyNode({
                    children: [
                        new JsonPrimitiveNode({
                            children: [
                                new JsonTokenNode({
                                    type: JsonTokenType.STRING,
                                    value: '"foo"',
                                }),
                            ],
                            token: new JsonTokenNode({
                                type: JsonTokenType.STRING,
                                value: '"foo"',
                            }),
                            value: '"foo"',
                        }),
                        new JsonTokenNode({
                            type: JsonTokenType.COLON,
                            value: ':',
                        }),
                        new JsonPrimitiveNode({
                            children: [
                                new JsonTokenNode({
                                    type: JsonTokenType.STRING,
                                    value: '"bar"',
                                }),
                            ],
                            token: new JsonTokenNode({
                                type: JsonTokenType.STRING,
                                value: '"bar"',
                            }),
                            value: '"bar"',
                        }),
                    ],
                    key: new JsonPrimitiveNode({
                        children: [
                            new JsonTokenNode({
                                type: JsonTokenType.STRING,
                                value: '"foo"',
                            }),
                        ],
                        token: new JsonTokenNode({
                            type: JsonTokenType.STRING,
                            value: '"foo"',
                        }),
                        value: '"foo"',
                    }),
                    value: new JsonPrimitiveNode({
                        children: [
                            new JsonTokenNode({
                                type: JsonTokenType.STRING,
                                value: '"bar"',
                            }),
                        ],
                        token: new JsonTokenNode({
                            type: JsonTokenType.STRING,
                            value: '"bar"',
                        }),
                        value: '"bar"',
                    }),
                }),
                new JsonTokenNode({
                    type: JsonTokenType.NEWLINE,
                    value: '\n',
                }),
                new JsonTokenNode({
                    type: JsonTokenType.WHITESPACE,
                    value: '',
                }),
                new JsonTokenNode({
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                }),
            ],
            properties: [property],
        }));
    });

    it('should rebuild with nested structure node', () => {
        const property = new JsonPropertyNode({
            children: [],
            key: JsonIdentifierNode.of('foo'),
            value: JsonPrimitiveNode.of('bar'),
        });

        const structureNode = new TestStructureNode({
            children: [
                property,
                new TestStructureNode({
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
            children: [
                new JsonTokenNode({
                    type: JsonTokenType.BRACE_LEFT,
                    value: '{',
                }),
                new JsonPropertyNode({
                    children: [
                        new JsonIdentifierNode({
                            children: [
                                new JsonTokenNode({
                                    type: JsonTokenType.IDENTIFIER,
                                    value: 'foo',
                                }),
                            ],
                            token: new JsonTokenNode({
                                type: JsonTokenType.IDENTIFIER,
                                value: 'foo',
                            }),
                        }),
                        new JsonTokenNode({
                            type: JsonTokenType.COLON,
                            value: ':',
                        }),
                        new JsonPrimitiveNode({
                            children: [
                                new JsonTokenNode({
                                    type: JsonTokenType.STRING,
                                    value: '"bar"',
                                }),
                            ],
                            token: new JsonTokenNode({
                                type: JsonTokenType.STRING,
                                value: '"bar"',
                            }),
                            value: 'bar',
                        }),
                    ],
                    key: new JsonIdentifierNode({
                        children: [
                            new JsonTokenNode({
                                type: JsonTokenType.IDENTIFIER,
                                value: 'foo',
                            }),
                        ],
                        token: new JsonTokenNode({
                            type: JsonTokenType.IDENTIFIER,
                            value: 'foo',
                        }),
                    }),
                    value: new JsonPrimitiveNode({
                        children: [
                            new JsonTokenNode({
                                type: JsonTokenType.STRING,
                                value: '"bar"',
                            }),
                        ],
                        token: new JsonTokenNode({
                            type: JsonTokenType.STRING,
                            value: '"bar"',
                        }),
                        value: 'bar',
                    }),
                }),
                new JsonTokenNode({
                    type: JsonTokenType.BRACE_RIGHT,
                    value: '}',
                }),
            ],
            properties: [property],
        }));
    });
});
