import {SourceLocation, SourcePosition} from '../src';

describe('SourcePosition', () => {
    it('should return a value for representing an unknown source position', () => {
        expect(SourcePosition.unknown()).toEqual({
            index: -1,
            line: 0,
            column: 0,
        });
    });
});

describe('SourceLocation', () => {
    it('should return a value for representing an unknown source location', () => {
        expect(SourceLocation.unknown()).toEqual({
            start: SourcePosition.unknown(),
            end: SourcePosition.unknown(),
        });
    });
});
