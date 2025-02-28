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
            value: 'foo',
            token: new JsonTokenNode({
                type: JsonTokenType.STRING,
                value: '"foo"',
            }),
            children: [JsonPrimitiveNode.of('foo')],
        });

        const value = new JsonPrimitiveNode({
            value: 'bar',
            token: new JsonTokenNode({
                type: JsonTokenType.STRING,
                value: '"bar"',
            }),
            children: [JsonPrimitiveNode.of('bar')],
        });

        const propertyNode = new JsonPropertyNode({
            key: key,
            value: value,
            children: [
                new JsonPropertyNode({
                    key: key,
                    value: value,
                }),
            ],
        });

        propertyNode.reset();

        expect(propertyNode.children).toBeEmpty();
        expect(propertyNode.key.children).toBeEmpty();
        expect(propertyNode.value.children).toBeEmpty();
    });

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
            key: key,
            value: value,
            children: [
                key, // Should preserve the original key
            ],
        });

        propertyNode.rebuild();

        expect(propertyNode.children).toStrictEqual([
            key,
            new JsonTokenNode({
                type: JsonTokenType.COLON,
                value: ':',
            }),
            value,
        ]);
    });

    type Scenario = {
        formatting: Formatting,
        children: JsonNode[],
        key: JsonStringNode,
        value: JsonStringNode,
    };

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
            key: JsonPrimitiveNode.of('foo'),
            value: JsonPrimitiveNode.of('bar'),
        });

        propertyNode.rebuild(scenario.formatting);

        expect(propertyNode).toStrictEqual(
            new JsonPropertyNode({
                children: scenario.children,
                key: scenario.key,
                value: scenario.value,
            }),
        );
    });

    it('should create a clone', () => {
        const key = JsonPrimitiveNode.of('foo');
        const value = JsonPrimitiveNode.of('bar');
        const token = new JsonTokenNode({
            type: JsonTokenType.COLON,
            value: ':',
        });

        const propertyNode = new JsonPropertyNode({
            key: key,
            value: value,
            children: [key, token, value],
        });

        const clone = propertyNode.clone();

        expect(clone).toStrictEqual(propertyNode);
        expect(clone).not.toBe(propertyNode);

        expect(clone.key).toStrictEqual(key);
        expect(clone.key).not.toBe(key);

        expect(clone.value).toStrictEqual(value);
        expect(clone.value).not.toBe(value);

        expect(clone.children[0]).toBe(clone.key);
        expect(clone.children[1]).toStrictEqual(token);
        expect(clone.children[1]).not.toBe(token);
        expect(clone.children[2]).toBe(clone.value);
    });

    it('should not be equivalent to a non-property node', () => {
        const left = new JsonPropertyNode({
            key: JsonPrimitiveNode.of('foo'),
            value: JsonPrimitiveNode.of('bar'),
        });

        const right = JsonPrimitiveNode.of('bar');

        expect(left.isEquivalent(right)).toBeFalse();
    });

    it('should not be equivalent to a node with different key', () => {
        const left = new JsonPropertyNode({
            key: JsonPrimitiveNode.of('foo'),
            value: JsonPrimitiveNode.of('bar'),
        });

        const right = new JsonPropertyNode({
            key: JsonPrimitiveNode.of('baz'),
            value: JsonPrimitiveNode.of('bar'),
        });

        expect(left.isEquivalent(right)).toBeFalse();
    });

    it('should not be equivalent to a node with different value', () => {
        const left = new JsonPropertyNode({
            key: JsonPrimitiveNode.of('foo'),
            value: JsonPrimitiveNode.of('bar'),
        });

        const right = new JsonPropertyNode({
            key: JsonPrimitiveNode.of('foo'),
            value: JsonPrimitiveNode.of('baz'),
        });

        expect(left.isEquivalent(right)).toBeFalse();
    });

    it('should be equivalent to a node with the same keys and values', () => {
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
