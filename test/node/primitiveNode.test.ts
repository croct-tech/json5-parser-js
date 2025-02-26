import {JsonArrayNode, JsonPrimitiveNode, JsonTokenNode, JsonTokenType} from '../../src';

describe('PrimitiveNode', () => {
    it('should create a string primitive node', () => {
        const primitiveNode = JsonPrimitiveNode.of('foo');

        expect(primitiveNode).toStrictEqual(JsonPrimitiveNode.of('foo'));
    });

    it('should create a number primitive node', () => {
        const primitiveNode = JsonPrimitiveNode.of(123);

        expect(primitiveNode).toStrictEqual(JsonPrimitiveNode.of(123));
    });

    it('should create a boolean primitive node', () => {
        const primitiveNode = JsonPrimitiveNode.of(true);

        expect(primitiveNode).toStrictEqual(JsonPrimitiveNode.of(true));
    });

    it('should create a null primitive node', () => {
        const primitiveNode = JsonPrimitiveNode.of(null);

        expect(primitiveNode).toStrictEqual(JsonPrimitiveNode.of(null));
    });

    it('should create a primitive node with a JSON primitive node', () => {
        const primitiveNode = JsonPrimitiveNode.of(JsonPrimitiveNode.of('foo'));

        expect(primitiveNode).toStrictEqual(
            JsonPrimitiveNode.of(JsonPrimitiveNode.of('foo')),
        );
    });

    it('should create a hex number primitive node', () => {
        const number = 123;
        const hexNumber = number.toString(16);

        const primitiveNode = JsonPrimitiveNode.ofHex(123);

        expect(primitiveNode).toStrictEqual(
            new JsonPrimitiveNode({
                token: new JsonTokenNode({
                    type: JsonTokenType.NUMBER,
                    value: `"0x${hexNumber}"`,
                }),
                value: number,
            }),
        );
    });

    it('should update the primitive node', () => {
        const primitiveNode = JsonPrimitiveNode.of('foo');

        const updatedNode = primitiveNode.update('bar');

        expect(updatedNode).toStrictEqual(JsonPrimitiveNode.of('bar'));

        expect(updatedNode).not.toBe(primitiveNode);

        expect(primitiveNode).toStrictEqual(JsonPrimitiveNode.of('foo'));
    });

    it('should update equivalent nodes', () => {
        const primitiveNode = JsonPrimitiveNode.of('foo');

        const updatedNode = primitiveNode.update('foo');

        expect(updatedNode).toStrictEqual(JsonPrimitiveNode.of('foo'));

        expect(updatedNode).toBe(primitiveNode);

        expect(primitiveNode).toStrictEqual(JsonPrimitiveNode.of('foo'));
    });

    it('should reset its children', () => {
        const primitiveNode = new JsonPrimitiveNode({
            value: 'foo',
            token: new JsonTokenNode({
                type: JsonTokenType.STRING,
                value: '"foo"',
            }),
            children: [JsonPrimitiveNode.of('foo')],
        });

        primitiveNode.reset();

        expect(primitiveNode.children).toStrictEqual([]);
    });

    it('should rebuild with formatting style', () => {
        const primitiveNode = new JsonPrimitiveNode({
            value: 'foo',
            token: new JsonTokenNode({
                type: JsonTokenType.STRING,
                value: '"foo"',
            }),
            children: [],
        });

        expect(primitiveNode.toString()).toStrictEqual('"foo"');

        primitiveNode.rebuild({
            string: {
                quote: 'single',
            },
        });

        expect(primitiveNode).toStrictEqual(
            new JsonPrimitiveNode({
                value: 'foo',
                token: new JsonTokenNode({
                    type: JsonTokenType.STRING,
                    value: '"foo"',
                }),
                children: [
                    new JsonTokenNode({
                        type: JsonTokenType.STRING,
                        value: '\'foo\'',
                    }),
                ],
            }),
        );
    });

    it('should clone the primitive node', () => {
        const primitiveNode = JsonPrimitiveNode.of('foo');

        const clone = primitiveNode.clone();

        expect(clone).toStrictEqual(
            new JsonPrimitiveNode({
                token: primitiveNode.token,
                value: primitiveNode.value,
                children: primitiveNode.children,
                location: primitiveNode.location,
            }),
        );

        expect(clone).not.toBe(primitiveNode);
    });

    it('should not be equivalent to a non primitive node', () => {
        const left = JsonPrimitiveNode.of('foo');

        const right = JsonArrayNode.of(1, 2, 3);

        expect(left.isEquivalent(right)).toBeFalse();
    });

    it('should not be equivalent to a node with different token', () => {
        const left = JsonPrimitiveNode.ofHex(20);

        const right = JsonPrimitiveNode.of(20);

        expect(left.isEquivalent(right)).toBeFalse();
    });

    it('should not be equivalent to a node with different values', () => {
        const left = JsonPrimitiveNode.of('foo');

        const right = JsonPrimitiveNode.of('bar');

        expect(left.isEquivalent(right)).toBeFalse();
    });

    it('should be equivalent to other node', () => {
        const left = JsonPrimitiveNode.of('foo');

        const right = JsonPrimitiveNode.of('foo');

        expect(left.isEquivalent(right)).toBeTrue();
    });

    it('should serialize to JSON', () => {
        const primitiveNode = JsonPrimitiveNode.of('foo');

        expect(primitiveNode.toJSON()).toStrictEqual('foo');
    });
});
