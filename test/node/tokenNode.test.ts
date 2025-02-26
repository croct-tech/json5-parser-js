import {JsonPrimitiveNode, JsonTokenNode, JsonTokenType} from '../../src';

describe('TokenNode', () => {
    it('should check whether a token is of a given type', () => {
        const token = new JsonTokenNode({
            type: JsonTokenType.STRING,
            value: 'foo',
        });

        expect(token.isType(JsonTokenType.NUMBER)).toBeFalse();

        expect(token.isType(JsonTokenType.STRING)).toBeTrue();
    });

    it('should clone the token', () => {
        const token = new JsonTokenNode({
            type: JsonTokenType.STRING,
            value: 'foo',
        });

        const clone = token.clone();

        expect(token).toStrictEqual(clone);
        expect(token).not.toBe(clone);
    });

    it('should not be equivalent when the other node is not a JSON token', () => {
        const left = new JsonTokenNode({
            type: JsonTokenType.STRING,
            value: 'foo',
        });

        const right = JsonPrimitiveNode.of('foo');

        expect(left.isEquivalent(right)).toBeFalse();
    });

    it('should not be equivalent when the other token type does not match', () => {
        const left = new JsonTokenNode({
            type: JsonTokenType.STRING,
            value: 'foo',
        });

        const right = new JsonTokenNode({
            type: JsonTokenType.NUMBER,
            value: 'foo',
        });

        expect(left.isEquivalent(right)).toBeFalse();
    });

    it('should not be equivalent when the other token value does not match', () => {
        const left = new JsonTokenNode({
            type: JsonTokenType.STRING,
            value: 'foo',
        });

        const right = new JsonTokenNode({
            type: JsonTokenType.STRING,
            value: 'bar',
        });

        expect(left.isEquivalent(right)).toBeFalse();
    });

    it('should be equivalent to other token node', () => {
        const left = new JsonTokenNode({
            type: JsonTokenType.STRING,
            value: 'foo',
        });

        const right = new JsonTokenNode({
            type: JsonTokenType.STRING,
            value: 'foo',
        });

        expect(left.isEquivalent(right)).toBeTrue();
    });

    it('should serialize to string', () => {
        const token = new JsonTokenNode({
            type: JsonTokenType.NUMBER,
            value: '123',
        });

        expect(token.toString()).toStrictEqual('123');
    });
});
