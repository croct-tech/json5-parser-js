import {JsonValue} from '@croct/json';
import {
    JsonArrayNode,
    JsonIdentifierNode,
    JsonObjectNode,
    JsonPrimitiveNode,
    JsonPropertyNode,
    JsonStringNode,
    JsonTokenNode,
    JsonTokenType,
    JsonValueNode,
} from '../../src';
import {JsonError} from '../../src/error';

describe('ObjectNode', () => {
    it('should create an object node', () => {
        const node = JsonObjectNode.of({foo: 'bar'});

        expect(node).toStrictEqual(
            new JsonObjectNode({
                properties: [
                    new JsonPropertyNode({
                        children: [],
                        key: JsonPrimitiveNode.of('foo'),
                        value: JsonPrimitiveNode.of('bar'),
                    }),
                ],
            }),
        );
    });

    it('should update a non-object value', () => {
        const node = JsonObjectNode.of({
            foo: 'bar',
        });

        expect(node.update('baz')).toStrictEqual(JsonPrimitiveNode.of('baz'));
    });

    it('should update a non-object node', () => {
        const node = JsonObjectNode.of({
            foo: 'bar',
        });

        const primitive = JsonPrimitiveNode.of('baz');

        expect(node.update(primitive)).toStrictEqual(JsonPrimitiveNode.of(primitive));
    });

    it('should update the node with an object value', () => {
        const node = JsonObjectNode.of({
            foo: 'bar',
            baz: 'qux',
        });

        const result = node.update({baz: 'qux'}).cast(JsonObjectNode);

        expect(result).toStrictEqual(JsonObjectNode.of({baz: 'qux'}));

        expect(node.properties[0]).toBe(result.properties[0]);
    });

    it('should update the node with an object node', () => {
        const node = JsonObjectNode.of({
            foo: 'bar',
            baz: 'qux',
        });

        const anotherNode = JsonObjectNode.of({
            baz: 'qux',
            quux: 'corge',
        });

        const result = node.update(anotherNode).cast(JsonObjectNode);

        expect(result).toStrictEqual(anotherNode);

        expect(node.properties[0]).toBe(result.properties[0]);
    });

    it('should remove undefined properties', () => {
        const node = JsonObjectNode.of({
            foo: 'bar',
        });

        const updatedNode = node.update({
            foo: undefined,
            bar: 'baz',
        });

        expect(updatedNode).toStrictEqual(JsonObjectNode.of({bar: 'baz'}));
    });

    it('should check whether an object has a property', () => {
        const node = JsonObjectNode.of({
            foo: 'bar',
        });

        expect(node.has('foo')).toBeTrue();
        expect(node.has('bar')).toBeFalse();
    });

    it('should get the properties', () => {
        const bar = JsonPrimitiveNode.of('bar');
        const baz = JsonPrimitiveNode.of('baz');

        const node = JsonObjectNode.of({
            foo: bar,
            bar: baz,
        });

        expect(node.properties).toStrictEqual([
            new JsonPropertyNode({
                key: JsonPrimitiveNode.of('foo'),
                value: bar,
            }),
            new JsonPropertyNode({
                key: JsonPrimitiveNode.of('bar'),
                value: baz,
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
                properties: [
                    new JsonPropertyNode({
                        key: JsonPrimitiveNode.of('foo'),
                        value: JsonPrimitiveNode.of('bar'),
                    }),
                    new JsonPropertyNode({
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
                properties: [
                    new JsonPropertyNode({
                        key: JsonPrimitiveNode.of('foo'),
                        value: JsonPrimitiveNode.of('qux'),
                    }),
                ],
            }),
        },
    }))('should set %s', (_, scenario) => {
        const node = JsonObjectNode.of({
            foo: 'bar',
        });

        node.set(scenario.name, scenario.value);

        expect(node).toStrictEqual(scenario.result);
    });

    it('should delete a property', () => {
        const node = JsonObjectNode.of({
            foo: 'bar',
        });

        node.delete('foo');

        expect(node).toStrictEqual(JsonObjectNode.of({}));
    });

    it('should fail to get a non-existing property', () => {
        const node = JsonObjectNode.of({
            foo: 'bar',
        });

        expect(() => node.get('bar')).toThrowWithMessage(
            Error,
            'Property "bar" does not exist.',
        );
    });

    it('should fail to get a property with an invalid type', () => {
        const node = JsonObjectNode.of({
            foo: 'bar',
        });

        expect(() => node.get('foo', JsonArrayNode)).toThrowWithMessage(
            JsonError,
            'Expected a value of type JsonArrayNode, but got JsonPrimitiveNode',
        );
    });

    it('should get a property', () => {
        const node = JsonObjectNode.of({
            foo: 'bar',
        });

        expect(node.get('foo', JsonPrimitiveNode)).toStrictEqual(JsonPrimitiveNode.of('bar'));
    });

    it('should create a clone', () => {
        const property = new JsonPropertyNode({
            key: JsonPrimitiveNode.of('foo'),
            value: JsonPrimitiveNode.of('bar'),
        });

        const node = new JsonObjectNode({
            properties: [property],
            children: [property],
        });

        const clone = node.clone();

        expect(node).toStrictEqual(clone);
        expect(node).not.toBe(clone);

        expect(node.properties[0]).toStrictEqual(clone.properties[0]);
        expect(node.properties[0]).not.toBe(clone.properties[0]);

        expect(node.children[0]).toStrictEqual(clone.children[0]);
        expect(node.children[0]).not.toBe(clone.children[0]);
    });

    it('should not be equivalent to a non-object node', () => {
        const left = JsonObjectNode.of({
            foo: 'bar',
        });

        const right = JsonArrayNode.of(1, 2, 3);

        expect(left.isEquivalent(right)).toBeFalse();
    });

    it('should not be equivalent to another node with different properties', () => {
        const left = JsonObjectNode.of({
            foo: 'bar',
        });

        const right = JsonObjectNode.of({
            foo: 'bar',
            qux: 'quux',
        });

        expect(left.isEquivalent(right)).toBeFalse();
    });

    it('should not be equivalent to another node with different values', () => {
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

    it('should be equivalent to another node with the same properties', () => {
        const left = JsonObjectNode.of({
            foo: 'bar',
        });

        const right = JsonObjectNode.of({
            foo: 'bar',
        });

        expect(left.isEquivalent(right)).toBeTrue();
    });

    it('should rebuild itself', () => {
        const node = JsonObjectNode.of({
            foo: 'bar',
        });

        node.rebuild();

        const key = new JsonPrimitiveNode({
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
        });

        const value = new JsonPrimitiveNode({
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
        });

        expect(node.children).toStrictEqual([
            new JsonTokenNode({
                type: JsonTokenType.BRACE_LEFT,
                value: '{',
            }),
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
            new JsonTokenNode({
                type: JsonTokenType.BRACE_RIGHT,
                value: '}',
            }),
        ]);
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
    }))('should serialize %s to JSON', (_, value) => {
        const node = JsonObjectNode.of({
            key: value,
        });

        expect(node.toJSON()).toStrictEqual({
            key: value,
        });
    });

    it.each([
		{
			sourceCode: `{
                /* Source pre-bar comment */
                "bar": 123, /* Inline comment */
                /* Source post-bar comment */
                "baz": true /* Another inline comment */ }`,
			destinationCode: `{
                // Destination pre-foo comment
                "foo": "value",
                // Destination post-foo comment
                "baz": [1, 2, 3] }`,
			expected: `{			
                // Destination pre-foo comment
                "foo": "value",
                /* Source pre-bar comment */
                "bar": 123, /* Inline comment */
                /* Source post-bar comment */
                "baz": true /* Another inline comment */ }`,
		},
		{
			sourceCode: `{
                /* Source pre-bar comment */ 
                "bar": 123, /* Inline comment */
                /* Source post-bar comment */
                "baz": true /* Another inline comment */ }`,
			destinationCode: `{           
                // Destination pre-foo comment
                "foo": "value",
                // Destination post-foo comment
                "fizz": 42 }`,
			expected: `{
                // Destination pre-foo comment
                "foo": "value",
                // Destination post-foo comment
                "fizz": 42,
                /* Source pre-bar comment */
                "bar": 123, /* Inline comment */
                /* Source post-bar comment */
                "baz": true /* Another inline comment */ }`,
		},
	])(
		'should merge two JsonObjectNode',
		({ sourceCode, destinationCode, expected }) => {
			const source = JsonParser.parse(sourceCode, JsonObjectNode);
			const destination = JsonParser.parse(destinationCode, JsonObjectNode);

			const node = JsonObjectNode.merge(source, destination);

			const removeWhiteSpaces = (str: string) => str.replace(/\s+/g, ' ');
			expect(removeWhiteSpaces(node.toString())).toStrictEqual(
				removeWhiteSpaces(expected)
			);
		}
	);
});
