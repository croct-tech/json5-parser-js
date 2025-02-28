import {Formatting, JsonArrayNode, JsonCompositeNode, PartialJsonCompositeDefinition} from '../../src';
import spyOn = jest.spyOn;

describe('CompositeNode', () => {
    class TestCompositeNode extends JsonCompositeNode {
        public static fromDefinition(definition: PartialJsonCompositeDefinition): TestCompositeNode {
            return new TestCompositeNode(definition);
        }

        public clone(): JsonCompositeNode {
            return TestCompositeNode.fromDefinition({
                children: this.children.map(child => child.clone()),
            });
        }

        public reset(): void {
        }

        public rebuild(formatting?: Formatting): void {
            for (const child of this.children) {
                if (child instanceof JsonArrayNode) {
                    child.rebuild(formatting);
                }
            }
        }

        public isEquivalent(): boolean {
            return true;
        }
    }

    it('should serialize to string', () => {
        const child = JsonArrayNode.of(1, 2, 3);
        const node = TestCompositeNode.fromDefinition({children: [child]});
        const clone = node.clone();

        const formatting = {
            array: {
                commaSpacing: true,
            },
        };

        expect(node.toString(formatting)).toStrictEqual('[1, 2, 3]');

        expect(node).toStrictEqual(clone);
    });

    it('should reformat the node', () => {
        const compositeNode = TestCompositeNode.fromDefinition({
            children: [JsonArrayNode.of(1, 2, 3)],
        });

        expect(compositeNode.toString()).toStrictEqual('[1,2,3]');

        const formatting: Formatting = {
            array: {
                commaSpacing: true,
            },
        };

        spyOn(compositeNode, 'reset');
        spyOn(compositeNode, 'rebuild');

        compositeNode.reformat(formatting);

        expect(compositeNode.reset).toHaveBeenCalled();
        expect(compositeNode.rebuild).toHaveBeenCalledWith(formatting);
    });
});
