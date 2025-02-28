import {JsonIdentifierNode, JsonPrimitiveNode, JsonTokenNode, JsonTokenType, reservedIdentifiers} from '../../src';
import {JsonError} from '../../src/error';

describe('IdentifierNode', () => {
    it.each([
        ...reservedIdentifiers.map(value => ({identifier: value})),
        // Not an exhaustive list
        {identifier: ''},
        {identifier: '123'},
        {identifier: '1a'},
        {identifier: ' '},
        {identifier: '!'},
        {identifier: 'a b'},
        {identifier: '😀'},
        {identifier: 'foo.bar'},
        {identifier: 'a\u0000b'},
    ])('should fail to create a node with an invalid identifier $identifier', ({identifier}) => {
        expect(() => JsonIdentifierNode.of(identifier)).toThrowWithMessage(
            JsonError,
            `Invalid identifier '${identifier}'.`,
        );
    });

    it('should create a valid identifier', () => {
        const node = JsonIdentifierNode.of('foo');

        const expected = new JsonIdentifierNode({
            token: new JsonTokenNode({
                type: JsonTokenType.IDENTIFIER,
                value: 'foo',
            }),
        });

        expect(node).toStrictEqual(expected);
    });

    it('should update the identifier', () => {
        const node = JsonIdentifierNode.of('foo');

        expect(node.update('bar')).toStrictEqual(JsonPrimitiveNode.of('bar'));
    });

    it('should update equivalent node identifiers', () => {
        const node = JsonIdentifierNode.of('foo');

        expect(node.update(node)).toBe(node);
    });

    it('should reset its children', () => {
        const node = new JsonIdentifierNode({
            token: new JsonTokenNode({
                type: JsonTokenType.IDENTIFIER,
                value: 'foo',
            }),
            children: [
                new JsonPrimitiveNode({
                    token: new JsonTokenNode({
                        type: JsonTokenType.STRING,
                        value: 'foo',
                    }),
                    children: [JsonPrimitiveNode.of('foo')],
                    value: 'foo',
                }),
            ],
        });

        node.reset();

        expect(node.children).toBeEmpty();
    });

    it('should rebuild the node', () => {
        const node = JsonIdentifierNode.of('foo');

        node.rebuild();

        expect(node.children).toStrictEqual([
            new JsonTokenNode({
                type: JsonTokenType.IDENTIFIER,
                value: 'foo',
            }),
        ]);
    });

    it('should create a clone', () => {
        const token = new JsonTokenNode({
            type: JsonTokenType.IDENTIFIER,
            value: 'foo',
        });

        const node = new JsonIdentifierNode({
            token: token,
            children: [token],
        });

        const clone = node.clone();

        expect(node).toStrictEqual(clone);
        expect(node).not.toBe(clone);
        expect(node.token).toStrictEqual(clone.token);
        expect(node.token).not.toBe(clone.token);

        expect(node.children[0]).toStrictEqual(clone.children[0]);
        expect(node.children[0]).not.toBe(clone.children[0]);
    });

    it('should not be equivalent to a non-identifier node', () => {
        const left = JsonIdentifierNode.of('foo');
        const right = JsonPrimitiveNode.of(0);

        expect(left.isEquivalent(right)).toBeFalse();
    });

    it('should not be equivalent to a node with different identifier', () => {
        const left = JsonIdentifierNode.of('foo');
        const right = JsonIdentifierNode.of('bar');

        expect(left.isEquivalent(right)).toBeFalse();
    });

    it('should be equivalent to a node with the same identifier', () => {
        const left = JsonIdentifierNode.of('foo');
        const right = JsonIdentifierNode.of('foo');

        expect(left.isEquivalent(right)).toBeTrue();
    });

    it('should serialize to JSON', () => {
        const node = JsonIdentifierNode.of('foo');

        expect(node.toJSON()).toStrictEqual('foo');
    });
});
