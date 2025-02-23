import {JsonValue} from '@croct/json';
import {JsonCompositeNode, JsonPrimitiveNode, JsonValueNode, SourceLocation} from '../../src';
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

        public clone(): JsonCompositeNode {
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

    it('should cast a value node', () => {
        const value = new TestJsonValue();

        expect(value.cast(TestJsonValue)).toBe(value);
    });

    it('should throw an error when casting a value node to an incompatible type', () => {
        const value = new TestJsonValue();

        expect(() => value.cast(JsonPrimitiveNode))
            .toThrowWithMessage(JsonError, 'Expected value of type JsonPrimitiveNode, but got TestJsonValue.');
    });
});
