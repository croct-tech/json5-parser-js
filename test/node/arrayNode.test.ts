import {JsonArrayNode, JsonObjectNode, JsonPrimitiveNode} from '../../src';
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
        const arrayNode = JsonArrayNode.of(...entries);

        expect(arrayNode.elements).toStrictEqual(elements);
    });

    it('should get its elements', () => {
        const arrayNode = JsonArrayNode.of(1, 2, 3);

        expect(arrayNode.elements).toStrictEqual([
            JsonPrimitiveNode.of(1),
            JsonPrimitiveNode.of(2),
            JsonPrimitiveNode.of(3),
        ]);
    });

    it('should fail to get an array element when the element type doesn\'t match', () => {
        const arrayNode = JsonArrayNode.of(1, 2, 3);

        expect(() => arrayNode.get(1, JsonArrayNode)).toThrowWithMessage(
            JsonError,
            'Expected JsonArrayNode at index 1, but got JsonPrimitiveNode.',
        );
    });

    it('should get an array element', () => {
        const arrayNode = JsonArrayNode.of(1, 2, 3);

        expect(arrayNode.get(1, JsonPrimitiveNode)).toStrictEqual(JsonPrimitiveNode.of(2));
    });

    it('should fail to set an array element when the index is out of the array limits', () => {
        const arrayNode = JsonArrayNode.of(1, 2, 3);

        expect(() => arrayNode.set(-1, 4)).toThrowWithMessage(
            Error,
            'Index -1 is out of bounds.',
        );
    });

    it('should set an array element', () => {
        const arrayNode = JsonArrayNode.of(1, 2, 3);

        arrayNode.set(2, 4);

        expect(arrayNode).toStrictEqual(JsonArrayNode.of(1, 2, 4));
    });

    it('should clear the array elements', () => {
        const arrayNode = JsonArrayNode.of(1, 2, 3);

        arrayNode.clear();

        expect(arrayNode).toStrictEqual(JsonArrayNode.of());
    });

    it('should fail to delete an array element when the index is out of the array limits', () => {
        const arrayNode = JsonArrayNode.of(1, 2, 3);

        expect(() => arrayNode.delete(-1)).toThrowWithMessage(
            Error,
            'Index -1 is out of bounds.',
        );
    });

    it('should delete an array element', () => {
        const arrayNode = JsonArrayNode.of(1, 2, 3);

        arrayNode.delete(2);

        expect(arrayNode).toStrictEqual(JsonArrayNode.of(1, 2));
    });

    it('should unshift elements in the array', () => {
        const arrayNode = JsonArrayNode.of(1, 2, 3);

        arrayNode.unshift(-1, 0);

        expect(arrayNode).toStrictEqual(JsonArrayNode.of(-1, 0, 1, 2, 3));
    });

    it('should push elements in the array', () => {
        const arrayNode = JsonArrayNode.of(1, 2, 3);

        arrayNode.push(4, 5);

        expect(arrayNode).toStrictEqual(JsonArrayNode.of(1, 2, 3, 4, 5));
    });

    it('should shift elements from the array', () => {
        const arrayNode = JsonArrayNode.of(1, 2, 3);

        arrayNode.shift();

        expect(arrayNode).toStrictEqual(JsonArrayNode.of(2, 3));
    });

    it('should pop elements from the array', () => {
        const arrayNode = JsonArrayNode.of(1, 2, 3);

        arrayNode.pop();

        expect(arrayNode).toStrictEqual(JsonArrayNode.of(1, 2));
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
        const arrayNode = JsonArrayNode.of(1, 2, 3);

        const removedItems = arrayNode.splice(
            scenario.initialIndex,
            scenario.amountToRemove,
            ...scenario.replacementElements,
        );

        expect(removedItems).toStrictEqual(scenario.removedItems);

        expect(arrayNode).toStrictEqual(JsonArrayNode.of(...scenario.expectedItems));
    });

    it('should clone the array node', () => {
        const arrayNode = JsonArrayNode.of(1, 2, 3);

        const clone = arrayNode.clone();

        expect(arrayNode).toStrictEqual(clone);

        expect(arrayNode).not.toBe(clone);
    });

    it('should update the node with a non array value', () => {
        const arrayNode = JsonArrayNode.of('foo', 'bar');

        const updatedNode = arrayNode.update('baz');

        expect(updatedNode).toStrictEqual(JsonPrimitiveNode.of('baz'));

        expect(arrayNode).toStrictEqual(JsonArrayNode.of('foo', 'bar'));
    });

    it('should update the node with an array value without merging', () => {
        const arrayNode = JsonArrayNode.of(1, 2, 3);

        const updatedNode = arrayNode.update([4, 5, 6, 7]);

        const expected = JsonArrayNode.of(4, 5, 6, 7);

        expect(updatedNode).toStrictEqual(expected);

        expect(arrayNode).toStrictEqual(expected);
    });

    it('should update the node merging an array value', () => {
        const arrayNode = JsonArrayNode.of(1, 2, 3, 4, 5);

        const updatedNode = arrayNode.update([1, 2], true);

        const expected = JsonArrayNode.of(1, 2);

        expect(updatedNode).toStrictEqual(expected);

        expect(arrayNode).toStrictEqual(expected);
    });

    it('should update the node with a node value without merging', () => {
        const arrayNode = JsonArrayNode.of(1, 2, 3);

        const updatedNode = arrayNode.update(JsonArrayNode.of(4, 5, 6, 7));

        const expected = JsonArrayNode.of(4, 5, 6, 7);

        expect(updatedNode).toStrictEqual(expected);

        expect(arrayNode).toStrictEqual(expected);
    });

    it('should update the node merging a node value', () => {
        const arrayNode = JsonArrayNode.of(1, 2, 3);

        const updatedNode = arrayNode.update(JsonArrayNode.of(4, 5, 6, 7), true);

        const expected = JsonArrayNode.of(4, 5, 6, 7);

        expect(updatedNode).toStrictEqual(expected);

        expect(arrayNode).toStrictEqual(expected);
    });

    it('should not be equivalent to a non-array node', () => {
        const left = JsonArrayNode.of(1, 2, 3);
        const right = JsonPrimitiveNode.of(0);

        expect(left.isEquivalent(right)).toBeFalse();
    });

    it('should not be equivalent when other node have extra elements', () => {
        const left = JsonArrayNode.of(1, 2, 3);
        const right = JsonArrayNode.of(1, 2, 3, 4);

        expect(left.isEquivalent(right)).toBeFalse();
    });

    it('should not be equivalent when other node have different element', () => {
        const left = JsonArrayNode.of(1, 2, 3);
        const right = JsonArrayNode.of(1, 2, 'three');

        expect(left.isEquivalent(right)).toBeFalse();
    });

    it('should not be equivalent when other node have elements with different order', () => {
        const left = JsonArrayNode.of(1, 2, 3);
        const right = JsonArrayNode.of(1, 3, 2);

        expect(left.isEquivalent(right)).toBeFalse();
    });

    it('should be equivalent when every element is equivalent', () => {
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
    }))('should serialize %s to its JSON format', (_, value) => {
        const arrayNode = JsonArrayNode.of(value);

        expect(arrayNode.toJSON()).toStrictEqual([value]);
    });
});
