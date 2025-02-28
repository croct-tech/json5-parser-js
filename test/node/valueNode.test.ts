import {JsonValue} from '@croct/json';
import {JsonPrimitiveNode, JsonValueNode, SourceLocation} from '../../src';
import {JsonError} from '../../src/error';

describe('ValueNode', () => {
    class TestJsonValue extends JsonValueNode {
        public constructor() {
            super({
                location: SourceLocation.unknown(),
            });
        }

        public update(): JsonValueNode {
            throw new Error('Method not implemented.');
        }

        public toJSON(): JsonValue {
            throw new Error('Method not implemented.');
        }

        public clone(): JsonValueNode {
            throw new Error('Method not implemented.');
        }

        public reset(): void {
            throw new Error('Method not implemented.');
        }

        public rebuild(): void {
            throw new Error('Method not implemented.');
        }

        public isEquivalent(): boolean {
            throw new Error('Method not implemented.');
        }
    }

    it('should cast to a compatible type', () => {
        const value = new TestJsonValue();

        expect(value.cast(TestJsonValue)).toBe(value);
    });

    it('should fail to cast to an incompatible type', () => {
        const value = new TestJsonValue();

        expect(() => value.cast(JsonPrimitiveNode))
            .toThrowWithMessage(JsonError, 'Expected value of type JsonPrimitiveNode, but got TestJsonValue.');
    });
});
