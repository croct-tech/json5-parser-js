import {JsonArrayNode, JsonObjectNode, JsonPrimitiveNode, JsonTokenNode, JsonTokenType} from '../../src';
import {JsonError} from '../../src/error';

describe('ArrayNode', () => {
    it.each([
        {
            entries: [],
            elements: [],
        },
        {
            entries: [1, 2, 3, Infinity, -Infinity, NaN],
            elements: [
                JsonPrimitiveNode.of(1),
                JsonPrimitiveNode.of(2),
                JsonPrimitiveNode.of(3),
                JsonPrimitiveNode.of(Infinity),
                JsonPrimitiveNode.of(-Infinity),
                JsonPrimitiveNode.of(NaN),
            ],
        },
        {
            entries: ['foo', 'bar'],
            elements: [
                JsonPrimitiveNode.of('foo'),
                JsonPrimitiveNode.of('bar'),
            ],
        },
        {
            entries: [false, true],
            elements: [
                JsonPrimitiveNode.of(false),
                JsonPrimitiveNode.of(true),
            ],
        },
        {
            entries: [[], [1, 2, 3]],
            elements: [
                JsonArrayNode.of(),
                JsonArrayNode.of(1, 2, 3),
            ],
        },
        {
            entries: [{}, {foo: 'bar'}],
            elements: [
                JsonObjectNode.of({}),
                JsonObjectNode.of({
                    foo: 'bar',
                }),
            ],
        },
        {
            entries: [null],
            elements: [
                JsonPrimitiveNode.of(null),
            ],
        },
    ])('should create a node with $entries', ({entries, elements}) => {
        const node = JsonArrayNode.of(...entries);

        expect(node.elements).toStrictEqual(elements);
    });

    it('should get its elements', () => {
        const node = JsonArrayNode.of(1, 2, 3);

        expect(node.elements).toStrictEqual([
            JsonPrimitiveNode.of(1),
            JsonPrimitiveNode.of(2),
            JsonPrimitiveNode.of(3),
        ]);
    });

    it('should fail to get an array element if the element type does not match', () => {
        const node = JsonArrayNode.of(1, 2, 3);

        expect(() => node.get(1, JsonArrayNode)).toThrowWithMessage(
            JsonError,
            'Expected JsonArrayNode at index 1, but got JsonPrimitiveNode.',
        );
    });

    it('should get the element at a specific index', () => {
        const element = JsonPrimitiveNode.of(2);
        const node = JsonArrayNode.of(1, element, 3);

        expect(node.get(1, JsonPrimitiveNode)).toBe(element);
    });

    it('should fail to set an element if the index is out of the array limits', () => {
        const node = JsonArrayNode.of(1, 2, 3);

        expect(() => node.set(-1, 4)).toThrowWithMessage(
            Error,
            'Index -1 is out of bounds.',
        );
    });

    it('should set an element at a specific index', () => {
        const node = JsonArrayNode.of(1, 2, 3);

        node.set(2, 4);

        expect(node).toStrictEqual(JsonArrayNode.of(1, 2, 4));
    });

    it('should clear the elements', () => {
        const node = JsonArrayNode.of(1, 2, 3);

        node.clear();

        expect(node).toStrictEqual(JsonArrayNode.of());
    });

    it('should fail to delete an element if the index is out of the array limits', () => {
        const node = JsonArrayNode.of(1, 2, 3);

        expect(() => node.delete(-1)).toThrowWithMessage(
            Error,
            'Index -1 is out of bounds.',
        );
    });

    it('should delete an element', () => {
        const node = JsonArrayNode.of(1, 2, 3);

        node.delete(2);

        expect(node).toStrictEqual(JsonArrayNode.of(1, 2));
    });

    it('should unshift elements in the array', () => {
        const node = JsonArrayNode.of(1, 2, 3);

        node.unshift(-1, 0);

        expect(node).toStrictEqual(JsonArrayNode.of(-1, 0, 1, 2, 3));
    });

    it('should push elements in the array', () => {
        const node = JsonArrayNode.of(1, 2, 3);

        node.push(4, 5);

        expect(node).toStrictEqual(JsonArrayNode.of(1, 2, 3, 4, 5));
    });

    it('should shift elements from the array', () => {
        const node = JsonArrayNode.of(1, 2, 3);

        node.shift();

        expect(node).toStrictEqual(JsonArrayNode.of(2, 3));
    });

    it('should pop elements from the array', () => {
        const node = JsonArrayNode.of(1, 2, 3);

        node.pop();

        expect(node).toStrictEqual(JsonArrayNode.of(1, 2));
    });

    it.each(Object.entries({
        'keeping all elements': {
            initialIndex: 0,
            amountToRemove: 0,
            replacementElements: [],
            removedItems: [],
            expectedItems: [1, 2, 3],
        },
        'removing no elements': {
            initialIndex: 3,
            amountToRemove: 1,
            replacementElements: [],
            removedItems: [],
            expectedItems: [1, 2, 3],
        },
        'removing an element': {
            initialIndex: 0,
            amountToRemove: 1,
            replacementElements: [],
            removedItems: [JsonPrimitiveNode.of(1)],
            expectedItems: [2, 3],
        },
        'adding elements': {
            initialIndex: 0,
            amountToRemove: 0,
            replacementElements: [JsonPrimitiveNode.of(-1), JsonPrimitiveNode.of(0)],
            removedItems: [],
            expectedItems: [-1, 0, 1, 2, 3],
        },
        'replacing elements': {
            initialIndex: 0,
            amountToRemove: 2,
            replacementElements: [JsonPrimitiveNode.of('one'), JsonPrimitiveNode.of('two')],
            removedItems: [JsonPrimitiveNode.of(1), JsonPrimitiveNode.of(2)],
            expectedItems: ['one', 'two', 3],
        },
    }))('should splice the array %s', (_, scenario) => {
        const node = JsonArrayNode.of(1, 2, 3);

        const removedItems = node.splice(
            scenario.initialIndex,
            scenario.amountToRemove,
            ...scenario.replacementElements,
        );

        expect(removedItems).toStrictEqual(scenario.removedItems);

        expect(node).toStrictEqual(JsonArrayNode.of(...scenario.expectedItems));
    });

    it('should clone the array node', () => {
        const node = JsonArrayNode.of(1, 2, 3);

        node.rebuild();

        expect(node.children).toHaveLength(7);

        const clone = node.clone();

        expect(node).toStrictEqual(clone);
        expect(node).not.toBe(clone);

        expect(node.elements[0]).not.toBe(clone.elements[0]);
        expect(node.elements[1]).not.toBe(clone.elements[1]);
        expect(node.elements[2]).not.toBe(clone.elements[2]);

        expect(clone.children[1]).toBe(clone.elements[0]);
        expect(clone.children[3]).toBe(clone.elements[1]);
        expect(clone.children[5]).toBe(clone.elements[2]);

        expect(node.children[0]).not.toBe(clone.children[0]);
        expect(node.children[1]).not.toBe(clone.children[1]);
        expect(node.children[2]).not.toBe(clone.children[2]);
        expect(node.children[3]).not.toBe(clone.children[3]);
        expect(node.children[4]).not.toBe(clone.children[4]);
        expect(node.children[5]).not.toBe(clone.children[5]);
        expect(node.children[6]).not.toBe(clone.children[6]);
    });

    it('should update the node with a non-array value', () => {
        const node = JsonArrayNode.of('foo', 'bar');

        const updatedNode = node.update('baz');

        expect(updatedNode).toStrictEqual(JsonPrimitiveNode.of('baz'));

        expect(node).toStrictEqual(JsonArrayNode.of('foo', 'bar'));
    });

    it('should update the node removing old elements', () => {
        const one = JsonPrimitiveNode.of(1);
        const node = JsonArrayNode.of(one, 2, 3, 4, 5);
        const expected = JsonArrayNode.of(1, 7, 8);

        expect(node.update([1, 7, 8])).toStrictEqual(expected);

        expect(node).toStrictEqual(expected);

        expect(node.elements[0]).toBe(one);
    });

    it('should update the node adding new elements', () => {
        const one = JsonPrimitiveNode.of(1);
        const two = JsonPrimitiveNode.of(2);
        const three = JsonPrimitiveNode.of(3);
        const node = JsonArrayNode.of(one, two, three);
        const expected = JsonArrayNode.of(1, 2, 3, 4, 5);

        expect(node.update([1, 2, 3, 4, 5])).toStrictEqual(expected);

        expect(node).toStrictEqual(expected);

        expect(node.elements[0]).toBe(one);
        expect(node.elements[1]).toBe(two);
        expect(node.elements[2]).toBe(three);
    });

    it('should not be equivalent to a non-array node', () => {
        const left = JsonArrayNode.of(1, 2, 3);
        const right = JsonPrimitiveNode.of(0);

        expect(left.isEquivalent(right)).toBeFalse();
    });

    it('should not be equivalent if the other node have extra elements', () => {
        const left = JsonArrayNode.of(1, 2, 3);
        const right = JsonArrayNode.of(1, 2, 3, 4);

        expect(left.isEquivalent(right)).toBeFalse();
    });

    it('should not be equivalent if the other node have a different element', () => {
        const left = JsonArrayNode.of(1, 2, 3);
        const right = JsonArrayNode.of(1, 2, 'three');

        expect(left.isEquivalent(right)).toBeFalse();
    });

    it('should not be equivalent if the other node have elements in a different order', () => {
        const left = JsonArrayNode.of(1, 2, 3);
        const right = JsonArrayNode.of(1, 3, 2);

        expect(left.isEquivalent(right)).toBeFalse();
    });

    it('should be equivalent if every element is equivalent', () => {
        const left = JsonArrayNode.of(1, 2, 3);
        const right = JsonArrayNode.of(1, 2, 3);

        expect(left.isEquivalent(right)).toBeTrue();
    });

    it.each(Object.entries({
        null: null,
        integer: 42,
        float: 123.456,
        string: 'foo',
        boolean: true,
        structure: {
            name: 'John Doe',
            age: 30,
            hobbies: ['reading'],
        },
        'nested array': [1, 2, 3],
        'empty object': {},
        'empty array': [],
    }))('should serialize %s to JSON', (_, value) => {
        const node = JsonArrayNode.of(value);

        expect(node.toJSON()).toStrictEqual([value]);
    });

    it('should rebuild itself', () => {
        const node = JsonArrayNode.of(1, 2, 3);

        node.rebuild();

        expect(node.children).toStrictEqual([
            new JsonTokenNode({
                type: JsonTokenType.BRACKET_LEFT,
                value: '[',
            }),
            node.elements[0],
            new JsonTokenNode({
                type: JsonTokenType.COMMA,
                value: ',',
            }),
            node.elements[1],
            new JsonTokenNode({
                type: JsonTokenType.COMMA,
                value: ',',
            }),
            node.elements[2],
            new JsonTokenNode({
                type: JsonTokenType.BRACKET_RIGHT,
                value: ']',
            }),
        ]);
    });
});
