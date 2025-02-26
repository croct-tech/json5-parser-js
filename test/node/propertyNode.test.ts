import {
    Formatting,
    JsonIdentifierNode,
    JsonNode,
    JsonPrimitiveNode,
    JsonPropertyNode,
    JsonStringNode,
    JsonTokenNode,
    JsonTokenType,
    SourceLocation,
} from '../../src';

describe('PropertyNode', () => {
    it('should set a value', () => {
        const propertyNode = new JsonPropertyNode({
            location: SourceLocation.unknown(),
            children: [],
            key: JsonPrimitiveNode.of('foo'),
            value: JsonPrimitiveNode.of('bar'),
        });

        propertyNode.set('baz');

        expect(propertyNode.value).toStrictEqual(JsonPrimitiveNode.of('baz'));
    });

    it('should reset its children', () => {
        const key = new JsonPrimitiveNode({
            location: SourceLocation.unknown(),
            children: [JsonPrimitiveNode.of('foo')],
            token: new JsonTokenNode({
                location: SourceLocation.unknown(),
                type: JsonTokenType.STRING,
                value: '"foo"',
            }),
            value: 'foo',
        });

        const value = new JsonPrimitiveNode({
            location: SourceLocation.unknown(),
            children: [JsonPrimitiveNode.of('bar')],
            token: new JsonTokenNode({
                location: SourceLocation.unknown(),
                type: JsonTokenType.STRING,
                value: '"bar"',
            }),
            value: 'bar',
        });

        const propertyNode = new JsonPropertyNode({
            location: SourceLocation.unknown(),
            children: [
                new JsonPropertyNode({
                    location: SourceLocation.unknown(),
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

    it.each(Object.entries<Scenario>({
        'single quote': {
            formatting: {
                string: {
                    quote: 'single',
                },
            },
            children: [
                new JsonPrimitiveNode({
                    location: SourceLocation.unknown(),
                    children: [
                        new JsonTokenNode({
                            location: SourceLocation.unknown(),
                            type: JsonTokenType.STRING,
                            value: "'foo'",
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
                            value: "'bar'",
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
                        value: "'foo'",
                    }),
                ],
                value: 'foo',
                token: new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.STRING,
                    value: '"foo"',
                }),
            }),
            value: new JsonPrimitiveNode({
                location: SourceLocation.unknown(),
                children: [
                    new JsonTokenNode({
                        location: SourceLocation.unknown(),
                        type: JsonTokenType.STRING,
                        value: "'bar'",
                    }),
                ],
                value: 'bar',
                token: new JsonTokenNode({
                    location: SourceLocation.unknown(),
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
                value: 'foo',
                token: new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.STRING,
                    value: '"foo"',
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
                value: 'bar',
                token: new JsonTokenNode({
                    location: SourceLocation.unknown(),
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
            key: new JsonPrimitiveNode({
                location: SourceLocation.unknown(),
                children: [
                    new JsonTokenNode({
                        location: SourceLocation.unknown(),
                        type: JsonTokenType.STRING,
                        value: '"foo"',
                    }),
                ],
                value: 'foo',
                token: new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.STRING,
                    value: '"foo"',
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
                value: 'bar',
                token: new JsonTokenNode({
                    location: SourceLocation.unknown(),
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
            key: new JsonPrimitiveNode({
                location: SourceLocation.unknown(),
                children: [],
                value: 'foo',
                token: new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.STRING,
                    value: '"foo"',
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
                value: 'bar',
                token: new JsonTokenNode({
                    location: SourceLocation.unknown(),
                    type: JsonTokenType.STRING,
                    value: '"bar"',
                }),
            }),
        },
    }))('should rebuild with %s formatting style', (_, scenario) => {
        const propertyNode = new JsonPropertyNode({
            location: SourceLocation.unknown(),
            children: [],
            key: JsonPrimitiveNode.of('foo'),
            value: JsonPrimitiveNode.of('bar'),
        });

        expect(propertyNode).toStrictEqual(
            new JsonPropertyNode({
                location: SourceLocation.unknown(),
                children: [],
                key: new JsonPrimitiveNode({
                    location: SourceLocation.unknown(),
                    children: [],
                    value: 'foo',
                    token: new JsonTokenNode({
                        location: SourceLocation.unknown(),
                        type: JsonTokenType.STRING,
                        value: '"foo"',
                    }),
                }),
                value: new JsonPrimitiveNode({
                    location: SourceLocation.unknown(),
                    children: [],
                    value: 'bar',
                    token: new JsonTokenNode({
                        location: SourceLocation.unknown(),
                        type: JsonTokenType.STRING,
                        value: '"bar"',
                    }),
                }),
            }),
        );

        propertyNode.rebuild(scenario.formatting);

        expect(propertyNode).toStrictEqual(
            new JsonPropertyNode({
                location: SourceLocation.unknown(),
                children: scenario.children,
                key: scenario.key,
                value: scenario.value,
            }),
        );
    });

    it('should clone the property node', () => {
        const propertyNode = new JsonPropertyNode({
            location: SourceLocation.unknown(),
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
            location: SourceLocation.unknown(),
            children: [],
            key: JsonPrimitiveNode.of('foo'),
            value: JsonPrimitiveNode.of('bar'),
        });

        const right = JsonPrimitiveNode.of('bar');

        expect(left.isEquivalent(right)).toBeFalse();
    });

    it('should not be equivalent when keys does not match', () => {
        const left = new JsonPropertyNode({
            location: SourceLocation.unknown(),
            children: [],
            key: JsonPrimitiveNode.of('foo'),
            value: JsonPrimitiveNode.of('bar'),
        });

        const right = new JsonPropertyNode({
            location: SourceLocation.unknown(),
            children: [],
            key: JsonPrimitiveNode.of('baz'),
            value: JsonPrimitiveNode.of('bar'),
        });

        expect(left.isEquivalent(right)).toBeFalse();
    });

    it('should not be equivalent when value does not match', () => {
        const left = new JsonPropertyNode({
            location: SourceLocation.unknown(),
            children: [],
            key: JsonPrimitiveNode.of('foo'),
            value: JsonPrimitiveNode.of('bar'),
        });

        const right = new JsonPropertyNode({
            location: SourceLocation.unknown(),
            children: [],
            key: JsonPrimitiveNode.of('foo'),
            value: JsonPrimitiveNode.of('baz'),
        });

        expect(left.isEquivalent(right)).toBeFalse();
    });

    it('should be equivalent to a node with equivalent key and value', () => {
        const left = new JsonPropertyNode({
            location: SourceLocation.unknown(),
            children: [],
            key: JsonPrimitiveNode.of('foo'),
            value: JsonPrimitiveNode.of('bar'),
        });

        const right = new JsonPropertyNode({
            location: SourceLocation.unknown(),
            children: [],
            key: JsonPrimitiveNode.of('foo'),
            value: JsonPrimitiveNode.of('bar'),
        });

        expect(left.isEquivalent(right)).toBeTrue();
    });
});
