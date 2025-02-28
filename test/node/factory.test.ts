import {
    JsonArrayNode,
    JsonObjectNode,
    JsonPrimitiveNode,
    JsonPropertyNode,
    JsonTokenNode,
    JsonTokenType,
    JsonValueFactory,
    SourceLocation,
} from '../../src';

describe('JsonValueFactory', () => {
    it('should do nothing if the value is JSON', () => {
        const value = JsonValueFactory.create({});

        expect(JsonValueFactory.create(value)).toBe(value);
    });

    it('should create a null node', () => {
        expect(JsonValueFactory.create(null)).toEqual(
            new JsonPrimitiveNode({
                value: null,
                token: new JsonTokenNode({
                    type: JsonTokenType.NULL,
                    value: 'null',
                    location: SourceLocation.unknown(),
                }),
                location: SourceLocation.unknown(),
            }),
        );
    });

    it('should create a boolean node', () => {
        expect(JsonValueFactory.create(true)).toEqual(
            new JsonPrimitiveNode({
                value: true,
                token: new JsonTokenNode({
                    type: JsonTokenType.BOOLEAN,
                    value: 'true',
                    location: SourceLocation.unknown(),
                }),
                location: SourceLocation.unknown(),
            }),
        );
    });

    it('should create a number node', () => {
        expect(JsonValueFactory.create(1)).toEqual(
            new JsonPrimitiveNode({
                value: 1,
                token: new JsonTokenNode({
                    type: JsonTokenType.NUMBER,
                    value: '1',
                    location: SourceLocation.unknown(),
                }),
                location: SourceLocation.unknown(),
            }),
        );
    });

    it('should create a string node', () => {
        expect(JsonValueFactory.create('"string"')).toEqual(
            new JsonPrimitiveNode({
                value: '"string"',
                token: new JsonTokenNode({
                    type: JsonTokenType.STRING,
                    value: '"\\"string\\""',
                    location: SourceLocation.unknown(),
                }),
                location: SourceLocation.unknown(),
            }),
        );
    });

    it('should create an array node', () => {
        expect(JsonValueFactory.create([1])).toEqual(
            new JsonArrayNode({
                elements: [JsonValueFactory.create(1)],
            }),
        );
    });

    it('should create an object node', () => {
        expect(JsonValueFactory.create({key: 1})).toEqual(
            new JsonObjectNode({
                properties: [
                    new JsonPropertyNode({
                        key: JsonValueFactory.create('key'),
                        value: JsonValueFactory.create(1),
                    }),
                ],
            }),
        );
    });
});
