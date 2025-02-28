import {JsonPrimitiveNode, JsonTokenNode, JsonTokenType} from '../../src';

describe('TokenNode', () => {
    it('should check whether a token matches a type', () => {
        const token = new JsonTokenNode({
            type: JsonTokenType.STRING,
            value: 'foo',
        });

        expect(token.isType(JsonTokenType.NUMBER)).toBeFalse();

        expect(token.isType(JsonTokenType.STRING)).toBeTrue();
    });

    it('should create a clone', () => {
        const token = new JsonTokenNode({
            type: JsonTokenType.STRING,
            value: 'foo',
        });

        const clone = token.clone();

        expect(token).toStrictEqual(clone);
        expect(token).not.toBe(clone);
    });

    it('should not be equivalent to another node of a different type', () => {
        const left = new JsonTokenNode({
            type: JsonTokenType.STRING,
            value: 'foo',
        });

        const right = JsonPrimitiveNode.of('foo');

        expect(left.isEquivalent(right)).toBeFalse();
    });

    it('should not be equivalent to another token of a different type', () => {
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

    it('should not be equivalent to another token with a different value', () => {
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

    it('should be equivalent to other tokens with the same value', () => {
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
