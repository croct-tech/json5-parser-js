import {
    Formatting,
    JsonIdentifierNode,
    JsonNode,
    JsonPrimitiveNode,
    JsonPropertyNode,
    JsonStringNode,
    JsonTokenNode,
    JsonTokenType,
} from '../../src';

describe('PropertyNode', () => {
    it('should set a value', () => {
        const propertyNode = new JsonPropertyNode({
            children: [],
            key: JsonPrimitiveNode.of('foo'),
            value: JsonPrimitiveNode.of('bar'),
        });

        propertyNode.set('baz');

        expect(propertyNode.value).toStrictEqual(JsonPrimitiveNode.of('baz'));
    });

    it('should reset its children', () => {
        const key = new JsonPrimitiveNode({
            children: [JsonPrimitiveNode.of('foo')],
            token: new JsonTokenNode({
                type: JsonTokenType.STRING,
                value: '"foo"',
            }),
            value: 'foo',
        });

        const value = new JsonPrimitiveNode({
            children: [JsonPrimitiveNode.of('bar')],
            token: new JsonTokenNode({
                type: JsonTokenType.STRING,
                value: '"bar"',
            }),
            value: 'bar',
        });

        const propertyNode = new JsonPropertyNode({
            children: [
                new JsonPropertyNode({
                    children: [],
                    key: key,
                    value: value,
                }),
            ],
            key: key,
            value: value,
        });

        propertyNode.reset();

        expect(propertyNode.children).toBeEmpty();
        expect(propertyNode.key.children).toBeEmpty();
        expect(propertyNode.value.children).toBeEmpty();
    });

    type Scenario = {
        formatting: Formatting,
        children: JsonNode[],
        key: JsonStringNode,
        value: JsonStringNode,
    };

    it('should rebuild its nodes', () => {
        const key = new JsonIdentifierNode({
            children: [
                new JsonTokenNode({
                    type: JsonTokenType.IDENTIFIER,
                    value: 'foo',
                }),
            ],
            token: new JsonTokenNode({
                type: JsonTokenType.IDENTIFIER,
                value: '"token value"',
            }),
        });

        const value = new JsonPrimitiveNode({
            children: [
                new JsonTokenNode({
                    type: JsonTokenType.STRING,
                    value: 'bar',
                }),
            ],
            token: new JsonTokenNode({
                type: JsonTokenType.STRING,
                value: '"bar"',
            }),
            value: 'bar',
        });

        const propertyNode = new JsonPropertyNode({
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
                        value: '"token value"',
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
                            value: 'bar',
                        }),
                    ],
                    token: new JsonTokenNode({
                        type: JsonTokenType.STRING,
                        value: '"bar"',
                    }),
                    value: 'bar',
                }),
            ],
            key: key,
            value: value,
        });

        propertyNode.rebuild();

        expect(propertyNode).toStrictEqual(
            new JsonPropertyNode({
                children: [
                    key,
                    new JsonTokenNode({
                        type: JsonTokenType.COLON,
                        value: ':',
                    }),
                    value,
                ],
                key: key,
                value: value,
            }),
        );
    });

    it.each(Object.entries<Scenario>({
        'single quote': {
            formatting: {
                string: {
                    quote: 'single',
                },
            },
            children: [
                new JsonPrimitiveNode({
                    children: [
                        new JsonTokenNode({
                            type: JsonTokenType.STRING,
                            value: "'foo'",
                        }),
                    ],
                    token: new JsonTokenNode({
                        type: JsonTokenType.STRING,
                        value: '"foo"',
                    }),
                    value: 'foo',
                }),
                new JsonTokenNode({
                    type: JsonTokenType.COLON,
                    value: ':',
                }),
                new JsonPrimitiveNode({
                    children: [
                        new JsonTokenNode({
                            type: JsonTokenType.STRING,
                            value: "'bar'",
                        }),
                    ],
                    token: new JsonTokenNode({
                        type: JsonTokenType.STRING,
                        value: '"bar"',
                    }),
                    value: 'bar',
                }),
            ],
            key: new JsonPrimitiveNode({
                children: [
                    new JsonTokenNode({
                        type: JsonTokenType.STRING,
                        value: "'foo'",
                    }),
                ],
                value: 'foo',
                token: new JsonTokenNode({
                    type: JsonTokenType.STRING,
                    value: '"foo"',
                }),
            }),
            value: new JsonPrimitiveNode({
                children: [
                    new JsonTokenNode({
                        type: JsonTokenType.STRING,
                        value: "'bar'",
                    }),
                ],
                value: 'bar',
                token: new JsonTokenNode({
                    type: JsonTokenType.STRING,
                    value: '"bar"',
                }),
            }),
        },
        'double quote': {
            formatting: {
                string: {
                    quote: 'double',
                },
            },
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
            key: new JsonPrimitiveNode({
                children: [
                    new JsonTokenNode({
                        type: JsonTokenType.STRING,
                        value: '"foo"',
                    }),
                ],
                value: 'foo',
                token: new JsonTokenNode({
                    type: JsonTokenType.STRING,
                    value: '"foo"',
                }),
            }),
            value: new JsonPrimitiveNode({
                children: [
                    new JsonTokenNode({
                        type: JsonTokenType.STRING,
                        value: '"bar"',
                    }),
                ],
                value: 'bar',
                token: new JsonTokenNode({
                    type: JsonTokenType.STRING,
                    value: '"bar"',
                }),
            }),
        },
        'colon spacing': {
            formatting: {
                object: {
                    colonSpacing: true,
                },
            },
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
            key: new JsonPrimitiveNode({
                children: [
                    new JsonTokenNode({
                        type: JsonTokenType.STRING,
                        value: '"foo"',
                    }),
                ],
                value: 'foo',
                token: new JsonTokenNode({
                    type: JsonTokenType.STRING,
                    value: '"foo"',
                }),
            }),
            value: new JsonPrimitiveNode({
                children: [
                    new JsonTokenNode({
                        type: JsonTokenType.STRING,
                        value: '"bar"',
                    }),
                ],
                value: 'bar',
                token: new JsonTokenNode({
                    type: JsonTokenType.STRING,
                    value: '"bar"',
                }),
            }),
        },
        'property quoting': {
            formatting: {
                property: {
                    unquoted: true,
                },
            },
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
            key: new JsonPrimitiveNode({
                children: [],
                value: 'foo',
                token: new JsonTokenNode({
                    type: JsonTokenType.STRING,
                    value: '"foo"',
                }),
            }),
            value: new JsonPrimitiveNode({
                children: [
                    new JsonTokenNode({
                        type: JsonTokenType.STRING,
                        value: '"bar"',
                    }),
                ],
                value: 'bar',
                token: new JsonTokenNode({
                    type: JsonTokenType.STRING,
                    value: '"bar"',
                }),
            }),
        },
    }))('should rebuild with %s formatting style', (_, scenario) => {
        const propertyNode = new JsonPropertyNode({
            children: [],
            key: JsonPrimitiveNode.of('foo'),
            value: JsonPrimitiveNode.of('bar'),
        });

        expect(propertyNode).toStrictEqual(
            new JsonPropertyNode({
                children: [],
                key: new JsonPrimitiveNode({
                    children: [],
                    value: 'foo',
                    token: new JsonTokenNode({
                        type: JsonTokenType.STRING,
                        value: '"foo"',
                    }),
                }),
                value: new JsonPrimitiveNode({
                    children: [],
                    value: 'bar',
                    token: new JsonTokenNode({
                        type: JsonTokenType.STRING,
                        value: '"bar"',
                    }),
                }),
            }),
        );

        propertyNode.rebuild(scenario.formatting);

        expect(propertyNode).toStrictEqual(
            new JsonPropertyNode({
                children: scenario.children,
                key: scenario.key,
                value: scenario.value,
            }),
        );
    });

    it('should clone the property node', () => {
        const propertyNode = new JsonPropertyNode({
            children: [JsonPrimitiveNode.of('foo')],
            key: JsonPrimitiveNode.of('foo'),
            value: JsonPrimitiveNode.of('bar'),
        });

        const clone = propertyNode.clone();

        expect(clone).toStrictEqual(propertyNode);

        expect(clone).not.toBe(propertyNode);
    });

    it('should not be equivalent when other node is not a JSON property node', () => {
        const left = new JsonPropertyNode({
            children: [],
            key: JsonPrimitiveNode.of('foo'),
            value: JsonPrimitiveNode.of('bar'),
        });

        const right = JsonPrimitiveNode.of('bar');

        expect(left.isEquivalent(right)).toBeFalse();
    });

    it('should not be equivalent when keys does not match', () => {
        const left = new JsonPropertyNode({
            children: [],
            key: JsonPrimitiveNode.of('foo'),
            value: JsonPrimitiveNode.of('bar'),
        });

        const right = new JsonPropertyNode({
            children: [],
            key: JsonPrimitiveNode.of('baz'),
            value: JsonPrimitiveNode.of('bar'),
        });

        expect(left.isEquivalent(right)).toBeFalse();
    });

    it('should not be equivalent when value does not match', () => {
        const left = new JsonPropertyNode({
            children: [],
            key: JsonPrimitiveNode.of('foo'),
            value: JsonPrimitiveNode.of('bar'),
        });

        const right = new JsonPropertyNode({
            children: [],
            key: JsonPrimitiveNode.of('foo'),
            value: JsonPrimitiveNode.of('baz'),
        });

        expect(left.isEquivalent(right)).toBeFalse();
    });

    it('should be equivalent to a node with equivalent key and value', () => {
        const left = new JsonPropertyNode({
            children: [],
            key: JsonPrimitiveNode.of('foo'),
            value: JsonPrimitiveNode.of('bar'),
        });

        const right = new JsonPropertyNode({
            children: [],
            key: JsonPrimitiveNode.of('foo'),
            value: JsonPrimitiveNode.of('bar'),
        });

        expect(left.isEquivalent(right)).toBeTrue();
    });
});
