import {Formatting, JsonArrayNode, JsonCompositeNode, PartialJsonCompositeDefinition} from '../../src';

describe('CompositeNode', () => {
    class TestCompositeNode extends JsonCompositeNode {
        public static fromDefinition(definition: PartialJsonCompositeDefinition): TestCompositeNode {
            return new TestCompositeNode(definition);
        }

        public clone(): JsonCompositeNode {
            return this;
        }

        public reset(): void {
            // NOOP
        }

        public rebuild(): void {
            // NOOP
        }

        public isEquivalent(): boolean {
            return true;
        }
    }

    it('should serialize to string', () => {
        const compositeNode = TestCompositeNode.fromDefinition({
            children: [JsonArrayNode.of(1, 2, 3)],
        });

        expect(compositeNode.toString()).toStrictEqual('');
    });

    it('should reformat the node', () => {
        const compositeNode = TestCompositeNode.fromDefinition({
            children: [JsonArrayNode.of(1, 2, 3)],
        });

        const formatting: Formatting = {
            array: {
                indentationSize: 4,
                commaSpacing: true,
                leadingIndentation: true,
            },
        };

        jest.spyOn(compositeNode, 'rebuild');

        compositeNode.reformat(formatting);

        expect(compositeNode.rebuild).toHaveBeenCalledTimes(1);
        expect(compositeNode.rebuild).toHaveBeenCalledWith(formatting);
    });
});
