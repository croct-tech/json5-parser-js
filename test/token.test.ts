import {JsonToken, JsonTokenType, SourceLocation} from '../src';

describe('Token', () => {
    it('should determine whether a token is of a specific type', () => {
        const token: JsonToken = {
            type: JsonTokenType.BOOLEAN,
            value: 'true',
            location: SourceLocation.unknown(),
        };

        expect(JsonToken.isType(token, JsonTokenType.BOOLEAN)).toBe(true);
        expect(JsonToken.isType(token, JsonTokenType.STRING)).toBe(false);
    });
});
