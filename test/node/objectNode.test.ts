import {JsonValue} from '@croct/json';
import {
    JsonArrayNode,
    JsonIdentifierNode,
    JsonObjectNode,
    JsonPrimitiveNode,
    JsonPropertyNode,
    JsonStringNode,
    JsonValueNode,
} from '../../src';
import {JsonError} from '../../src/error';

describe('ObjectNode', () => {
    it('should create an object node', () => {
        const objectNode = JsonObjectNode.of({
            foo: 'bar',
        });

        expect(objectNode.children).toStrictEqual([]);
    });

    it('should update a non object node', () => {
        const objectNode = JsonObjectNode.of({
            foo: 'bar',
        });

        const updatedNode = objectNode.update('baz');

        expect(updatedNode).toStrictEqual(JsonPrimitiveNode.of('baz'));

        expect(objectNode).toStrictEqual(JsonObjectNode.of({
            foo: 'bar',
        }));
    });

    it('should update the node with a object value', () => {
        const objectNode = JsonObjectNode.of({
            foo: 'bar',
        });

        const updatedNode = objectNode.update({
            baz: 'qux',
        });

        expect(updatedNode).toStrictEqual(JsonObjectNode.of({
            baz: 'qux',
        }));

        expect(objectNode).toStrictEqual(JsonObjectNode.of({
            baz: 'qux',
        }));
    });

    it('should update an undefined object property', () => {
        const objectNode = JsonObjectNode.of({
            foo: 'bar',
        });

        const updatedNode = objectNode.update({
            foo: undefined,
        });

        expect(updatedNode).toStrictEqual(JsonObjectNode.of({}));

        expect(objectNode).toStrictEqual(JsonObjectNode.of({}));
    });

    it('should update an object property', () => {
        const objectNode = JsonObjectNode.of({
            foo: 'bar',
        });

        const updatedNode = objectNode.update({
            foo: 'baz',
        });

        expect(updatedNode).toStrictEqual(JsonObjectNode.of({
            foo: 'baz',
        }));

        expect(objectNode).toStrictEqual(JsonObjectNode.of({
            foo: 'baz',
        }));
    });

    it('should update merging object properties', () => {
        const objectNode = JsonObjectNode.of({
            foo: 'bar',
            qux: 'quux',
            corge: 'grault',
        });

        const updatedNode = objectNode.update(
            {
                foo: 'baz',
                qux: undefined,
                corge: 'garply',
            },
            true,
        );

        expect(updatedNode).toStrictEqual(JsonObjectNode.of({
            foo: 'baz',
            corge: 'garply',
        }));

        expect(updatedNode).toStrictEqual(JsonObjectNode.of({
            foo: 'baz',
            corge: 'garply',
        }));
    });

    it('should update non JSON object nodes', () => {
        const objectNode = JsonObjectNode.of({
            foo: 'bar',
        });

        const updatedNode = objectNode.update(JsonPrimitiveNode.of('foo'));

        expect(updatedNode).toStrictEqual(JsonPrimitiveNode.of('foo'));

        expect(objectNode).toStrictEqual(JsonObjectNode.of({
            foo: 'bar',
        }));
    });

    it('should update new node properties', () => {
        const objectNode = JsonObjectNode.of({
            foo: 'bar',
        });

        const updatedNode = objectNode.update(JsonObjectNode.of({
            qux: 'quux',
        }));

        expect(updatedNode).toStrictEqual(JsonObjectNode.of({
            qux: 'quux',
        }));

        expect(objectNode).toStrictEqual(JsonObjectNode.of({
            qux: 'quux',
        }));
    });

    it('should update existing node properties', () => {
        const objectNode = JsonObjectNode.of({
            foo: 'bar',
        });

        const updatedNode = objectNode.update(JsonObjectNode.of({
            foo: 'qux',
        }));

        expect(updatedNode).toStrictEqual(JsonObjectNode.of({
            foo: 'bar',
        }));

        expect(objectNode).toStrictEqual(JsonObjectNode.of({
            foo: 'bar',
        }));
    });

    it('should update merging node properties', () => {
        const objectNode = JsonObjectNode.of({
            foo: 'bar',
            qux: 'quux',
            corge: 'grault',
        });

        const updatedNode = objectNode.update(
            JsonObjectNode.of({
                foo: 'baz',
                corge: 'garply',
            }),
            true,
        );

        expect(updatedNode).toStrictEqual(JsonObjectNode.of({
            foo: 'bar',
            qux: 'quux',
            corge: 'grault',
        }));

        expect(updatedNode).toStrictEqual(JsonObjectNode.of({
            foo: 'bar',
            qux: 'quux',
            corge: 'grault',
        }));
    });

    it('should check whether an object node has a key', () => {
        const objectNode = JsonObjectNode.of({
            foo: 'bar',
        });

        expect(objectNode.has('foo')).toBeTrue();

        expect(objectNode.has('bar')).toBeFalse();
    });

    it('should get its properties', () => {
        const objectNode = JsonObjectNode.of({
            foo: 'bar',
        });

        expect(objectNode.properties).toStrictEqual([
            new JsonPropertyNode({
                key: JsonPrimitiveNode.of('foo'),
                value: JsonPrimitiveNode.of('bar'),
                children: [],
            }),
        ]);
    });

    type Scenario = {
        name: string | JsonStringNode | JsonIdentifierNode,
        value: JsonValue | JsonValueNode,
        result: JsonObjectNode,
    };

    it.each(Object.entries<Scenario>({
        'a literal string key-value pair': {
            name: 'qux',
            value: 'quux',
            result: JsonObjectNode.of({
                foo: 'bar',
                qux: 'quux',
            }),
        },
        'a JSON primitive node key-value pair': {
            name: JsonPrimitiveNode.of('qux'),
            value: JsonPrimitiveNode.of('quux'),
            result: JsonObjectNode.of({
                foo: 'bar',
                qux: 'quux',
            }),
        },
        'a JSON identifier node key-value pair': {
            name: JsonIdentifierNode.of('qux'),
            value: JsonPrimitiveNode.of('quux'),
            result: new JsonObjectNode({
                children: [],
                properties: [
                    new JsonPropertyNode({
                        children: [],
                        key: JsonPrimitiveNode.of('foo'),
                        value: JsonPrimitiveNode.of('bar'),
                    }),
                    new JsonPropertyNode({
                        children: [],
                        key: JsonIdentifierNode.of('qux'),
                        value: JsonPrimitiveNode.of('quux'),
                    }),
                ],
            }),
        },
        'an existing property': {
            name: 'foo',
            value: JsonPrimitiveNode.of('qux'),
            result: new JsonObjectNode({
                children: [],
                properties: [
                    new JsonPropertyNode({
                        children: [],
                        key: JsonPrimitiveNode.of('foo'),
                        value: JsonPrimitiveNode.of('qux'),
                    }),
                ],
            }),
        },
    }))('should set %s', (_, scenario) => {
        const objectNode = JsonObjectNode.of({
            foo: 'bar',
        });

        objectNode.set(scenario.name, scenario.value);

        expect(objectNode).toStrictEqual(scenario.result);
    });

    it('should delete a property', () => {
        const objectNode = JsonObjectNode.of({
            foo: 'bar',
        });

        objectNode.delete('foo');

        expect(objectNode).toStrictEqual(JsonObjectNode.of({}));
    });

    it('should fail to get an unexisting property', () => {
        const objectNode = JsonObjectNode.of({
            foo: 'bar',
        });

        expect(() => objectNode.get('bar')).toThrowWithMessage(
            Error,
            'Property "bar" does not exist.',
        );
    });

    it('should fail when the property does not match the expected type', () => {
        const objectNode = JsonObjectNode.of({
            foo: 'bar',
        });

        expect(() => objectNode.get('foo', JsonArrayNode)).toThrowWithMessage(
            JsonError,
            'Expected a value of type JsonArrayNode, but got JsonPrimitiveNode',
        );
    });

    it('should get a property', () => {
        const objectNode = JsonObjectNode.of({
            foo: 'bar',
        });

        expect(objectNode.get('foo', JsonPrimitiveNode)).toStrictEqual(JsonPrimitiveNode.of('bar'));
    });

    it('should clone the object node', () => {
        const property = new JsonPropertyNode({
            children: [],
            key: JsonPrimitiveNode.of('foo'),
            value: JsonPrimitiveNode.of('bar'),
        });

        const objectNode = new JsonObjectNode({
            children: [property],
            properties: [property],
        });

        const clone = objectNode.clone();

        expect(objectNode).toStrictEqual(clone);
        expect(objectNode).not.toBe(clone);

        expect(objectNode.children[0]).toStrictEqual(clone.children[0]);
        expect(objectNode.children[0]).not.toBe(clone.children[0]);
    });

    it('should not be equivalent to a non-object node', () => {
        const left = JsonObjectNode.of({
            foo: 'bar',
        });

        const right = JsonArrayNode.of(1, 2, 3);

        expect(left.isEquivalent(right)).toBeFalse();
    });

    it('should not be equivalent when other node have extra properties', () => {
        const left = JsonObjectNode.of({
            foo: 'bar',
        });

        const right = JsonObjectNode.of({
            foo: 'bar',
            qux: 'quux',
        });

        expect(left.isEquivalent(right)).toBeFalse();
    });

    it('should not be equivalent when properties are not equivalent', () => {
        const left = JsonObjectNode.of({
            foo: 'bar',
        });

        const right = new JsonObjectNode({
            children: [],
            properties: [
                new JsonPropertyNode({
                    children: [],
                    key: JsonIdentifierNode.of('foo'),
                    value: JsonPrimitiveNode.of('bar'),
                }),
            ],
        });

        expect(left.isEquivalent(right)).toBeFalse();
    });

    it('should be equivalent when every property is equivalent', () => {
        const left = JsonObjectNode.of({
            foo: 'bar',
        });

        const right = JsonObjectNode.of({
            foo: 'bar',
        });

        expect(left.isEquivalent(right)).toBeTrue();
    });

    it.each(Object.entries({
        null: null,
        integer: 42,
        float: 123.456,
        string: 'foo',
        boolean: true,
        structure: {
            name: 'John Doe',
            age: 30,
            hobbies: ['reading'],
        },
        'nested array': [1, 2, 3],
        'empty object': {},
        'empty array': [],
    }))('should serialize %s to its JSON format', (_, value) => {
        const objectNode = JsonObjectNode.of({
            key: value,
        });

        expect(objectNode.toJSON()).toStrictEqual({
            key: value,
        });
    });
});
