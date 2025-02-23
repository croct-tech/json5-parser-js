import {JsonError, JsonParseError} from '../src/error';
import {SourceLocation} from '../src';

describe('JsonError', () => {
    it('should have a message', () => {
        const error = new JsonError('message');

        expect(error.message).toBe('message');
    });
});

describe('JsonParseError', () => {
    it('should have a message and location', () => {
        const location = SourceLocation.unknown();
        const error = new JsonParseError('message', location);

        expect(error.message).toBe('message');
        expect(error.location).toBe(location);
    });
});
