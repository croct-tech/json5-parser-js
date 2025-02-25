import {JsonNode, PartialJsonNodeDefinition, SourceLocation} from '../../src';

describe('Node', () => {
    class TestJsonNode extends JsonNode {
        public static fromDefinition(definition: PartialJsonNodeDefinition): TestJsonNode {
            return new TestJsonNode(definition);
        }

        public isEquivalent(): boolean {
            return true;
        }

        public clone(): JsonNode {
            throw new Error('Method not implemented.');
        }

        public toString(): string {
            throw new Error('Method not implemented.');
        }
    }

    const sourceLocation = SourceLocation.unknown();

    it.each(Object.entries<SourceLocation>({
        'start index': {
            ...sourceLocation,
            start: {
                ...sourceLocation.start,
                index: 1,
            },
        },
        'start line': {
            ...sourceLocation,
            start: {
                ...sourceLocation.start,
                line: 1,
            },
        },
        'start column': {
            ...sourceLocation,
            start: {
                ...sourceLocation.start,
                column: 1,
            },
        },
        'end index': {
            ...sourceLocation,
            end: {
                ...sourceLocation.end,
                index: 1,
            },
        },
        'end line': {
            ...sourceLocation,
            end: {
                ...sourceLocation.end,
                line: 1,
            },
        },
        'end column': {
            ...sourceLocation,
            end: {
                ...sourceLocation.end,
                column: 1,
            },
        },
    }))('should not be equal other node with different %s', (_, location) => {
        const left = TestJsonNode.fromDefinition({
            location: sourceLocation,
        });

        const right = TestJsonNode.fromDefinition({
            location: location,
        });

        expect(left.equals(right)).toBeFalse();
    });

    it('should be equal to other node', () => {
        const left = TestJsonNode.fromDefinition({
            location: sourceLocation,
        });

        const right = TestJsonNode.fromDefinition({
            location: sourceLocation,
        });

        expect(left.equals(right)).toBeTrue();
    })
});
