import {
    JsonIdentifierNode,
    JsonPrimitiveNode,
    JsonTokenNode,
    JsonTokenType,
    reservedIdentifiers,
    SourceLocation
} from '../../src';
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

    it('should create a not with a valid identifier', () => {
        const identifierNode = JsonIdentifierNode.of('foo');

        const expected = new JsonIdentifierNode({
            token: new JsonTokenNode({
                type: JsonTokenType.IDENTIFIER,
                value: 'foo',
            }),
        });

        expect(identifierNode).toStrictEqual(expected);
    });

    it('should update the identifier', () => {
        const identifierNode = JsonIdentifierNode.of('foo');

        const updatedNode = identifierNode.update('bar');

        expect(updatedNode).toStrictEqual(JsonPrimitiveNode.of('bar'));

        expect(identifierNode).toStrictEqual(JsonIdentifierNode.of('foo'));
    });

    it('should update equivalent node identifiers', () => {
        const identifierNode = JsonIdentifierNode.of('foo');

        const updatedNode = identifierNode.update(JsonIdentifierNode.of('foo'));

        expect(updatedNode).toBe(identifierNode);

        expect(identifierNode.toJSON()).toStrictEqual('foo');
    });

    // @todo see if this test can be improved
    it('should reset its children', () => {
        const identifierNode = JsonIdentifierNode.of('foo');

        identifierNode.reset();

        expect(identifierNode).toStrictEqual(JsonIdentifierNode.of('foo'));
    });

    it('should rebuild the node', () => {
        const identifierNode = JsonIdentifierNode.of('foo');

        identifierNode.rebuild();

        expect(identifierNode).toStrictEqual(new JsonIdentifierNode({
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
        }));
    });

    // @todo see if this test can be improved
    it('should clone the node', () => {
        const identifierNode = JsonIdentifierNode.of('foo');

        const clone = identifierNode.clone();

        expect(identifierNode).toStrictEqual(clone);
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

    it('should be equivalent to a node with same idenfitier', () => {
        const left = JsonIdentifierNode.of('foo');
        const right = JsonIdentifierNode.of('foo');

        expect(left.isEquivalent(right)).toBeTrue();
    });

    it('should serialize to JSON', () => {
        const identifierNode = JsonIdentifierNode.of('foo');

        expect(identifierNode.toJSON()).toStrictEqual('foo');
    });
});
