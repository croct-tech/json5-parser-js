import {JsonArrayNode, JsonNode, JsonPrimitiveNode, JsonPropertyNode, JsonTokenNode, JsonTokenType} from '../src';
import {NodeManipulator, NodeMatcher} from '../src/manipulator';

describe('NodeMatcher', () => {
    const booleanToken = new JsonTokenNode({type: JsonTokenType.BOOLEAN, value: 'true'});
    const numberToken = new JsonTokenNode({type: JsonTokenType.NUMBER, value: '42'});
    const arrayNode = new JsonArrayNode({elements: []});
    const whitespaceToken = new JsonTokenNode({type: JsonTokenType.WHITESPACE, value: ' '});
    const newlineToken = new JsonTokenNode({type: JsonTokenType.NEWLINE, value: '\n'});
    const lineCommentToken = new JsonTokenNode({type: JsonTokenType.LINE_COMMENT, value: '// comment'});
    const blockCommentToken = new JsonTokenNode({type: JsonTokenType.BLOCK_COMMENT, value: '/* comment */'});
    const insignificantToken = whitespaceToken;
    const significantToken = booleanToken;

    it('should match any node', () => {
        expect(NodeMatcher.ANY(booleanToken)).toBe(true);
        expect(NodeMatcher.ANY(arrayNode)).toBe(true);
    });

    it('should match no node', () => {
        expect(NodeMatcher.NONE(booleanToken)).toBe(false);
        expect(NodeMatcher.NONE(arrayNode)).toBe(false);
    });

    it('should match whitespace node', () => {
        expect(NodeMatcher.WHITESPACE(whitespaceToken)).toBe(true);
        expect(NodeMatcher.WHITESPACE(newlineToken)).toBe(false);
    });

    it('should match newline node', () => {
        expect(NodeMatcher.NEWLINE(newlineToken)).toBe(true);
        expect(NodeMatcher.NEWLINE(whitespaceToken)).toBe(false);
    });

    it('should match space node', () => {
        expect(NodeMatcher.SPACE(whitespaceToken)).toBe(true);
        expect(NodeMatcher.SPACE(newlineToken)).toBe(true);
        expect(NodeMatcher.SPACE(lineCommentToken)).toBe(false);
    });

    it('should match line comment node', () => {
        expect(NodeMatcher.LINE_COMMENT(lineCommentToken)).toBe(true);
        expect(NodeMatcher.LINE_COMMENT(blockCommentToken)).toBe(false);
    });

    it('should match block comment node', () => {
        expect(NodeMatcher.BLOCK_COMMENT(blockCommentToken)).toBe(true);
        expect(NodeMatcher.BLOCK_COMMENT(lineCommentToken)).toBe(false);
    });

    it('should match comment node', () => {
        expect(NodeMatcher.COMMENT(lineCommentToken)).toBe(true);
        expect(NodeMatcher.COMMENT(blockCommentToken)).toBe(true);
        expect(NodeMatcher.COMMENT(whitespaceToken)).toBe(false);
    });

    it('should match insignificant node', () => {
        expect(NodeMatcher.INSIGNIFICANT(insignificantToken)).toBe(true);
        expect(NodeMatcher.INSIGNIFICANT(newlineToken)).toBe(true);
        expect(NodeMatcher.INSIGNIFICANT(lineCommentToken)).toBe(true);
        expect(NodeMatcher.INSIGNIFICANT(blockCommentToken)).toBe(true);
        expect(NodeMatcher.INSIGNIFICANT(significantToken)).toBe(false);
    });

    it('should match significant node', () => {
        expect(NodeMatcher.SIGNIFICANT(significantToken)).toBe(true);
        expect(NodeMatcher.SIGNIFICANT(numberToken)).toBe(true);
        expect(NodeMatcher.SIGNIFICANT(whitespaceToken)).toBe(false);
        expect(NodeMatcher.SIGNIFICANT(newlineToken)).toBe(false);
        expect(NodeMatcher.SIGNIFICANT(lineCommentToken)).toBe(false);
        expect(NodeMatcher.SIGNIFICANT(blockCommentToken)).toBe(false);
    });

    it('should match punctuation node', () => {
        expect(NodeMatcher.PUNCTUATION(new JsonTokenNode({type: JsonTokenType.COLON, value: ':'}))).toBe(true);
        expect(NodeMatcher.PUNCTUATION(new JsonTokenNode({type: JsonTokenType.COMMA, value: ','}))).toBe(true);
        expect(NodeMatcher.PUNCTUATION(new JsonTokenNode({type: JsonTokenType.BRACE_LEFT, value: '{'}))).toBe(true);
        expect(NodeMatcher.PUNCTUATION(new JsonTokenNode({type: JsonTokenType.BRACE_RIGHT, value: '}'}))).toBe(true);
        expect(NodeMatcher.PUNCTUATION(new JsonTokenNode({type: JsonTokenType.BRACKET_LEFT, value: '['}))).toBe(true);
        expect(NodeMatcher.PUNCTUATION(new JsonTokenNode({type: JsonTokenType.BRACKET_RIGHT, value: ']'}))).toBe(true);
        expect(NodeMatcher.PUNCTUATION(new JsonTokenNode({type: JsonTokenType.BOOLEAN, value: 'true'}))).toBe(false);
    });
});

describe('NodeManipulator', () => {
    it('should get its values', () => {
        const manipulator = new NodeManipulator([
            JsonPrimitiveNode.of('foo'),
            JsonPrimitiveNode.of('bar'),
        ]);

        expect(manipulator.nodeList).toStrictEqual([
            JsonPrimitiveNode.of('foo'),
            JsonPrimitiveNode.of('bar'),
        ]);

        manipulator.insert(JsonPrimitiveNode.of('baz'));

        expect(manipulator.nodeList).toStrictEqual([
            JsonPrimitiveNode.of('baz'),
            JsonPrimitiveNode.of('foo'),
            JsonPrimitiveNode.of('bar'),
        ]);
    });

    it('should indicate whether the iterator has reached the end', () => {
        const manipulator = new NodeManipulator([
            JsonPrimitiveNode.of('foo'),
            JsonPrimitiveNode.of('bar'),
        ]);

        expect(manipulator.done()).toBeFalse();

        manipulator.next();

        expect(manipulator.done()).toBeFalse();

        manipulator.next();

        expect(manipulator.done()).toBeTrue();
    });

    it('should advance to the next node in the children list', () => {
        const firstNode = JsonPrimitiveNode.of('foo');
        const secondNode = JsonPrimitiveNode.of('bar');

        const manipulator = new NodeManipulator([firstNode, secondNode]);

        expect(manipulator.current).toBe(firstNode);

        manipulator.next();

        expect(manipulator.current).toBe(secondNode);
    });

    it('should fail to advance when the iterator is at the end of the list', () => {
        const manipulator = new NodeManipulator([JsonPrimitiveNode.of('foo')]);

        manipulator.next();

        expect(() => manipulator.next()).toThrowWithMessage(
            Error,
            'The iterator is at the end of the list.',
        );
    });

    it('should return the current position in the children list', () => {
        const manipulator = new NodeManipulator([
            JsonPrimitiveNode.of('foo'),
            JsonPrimitiveNode.of('bar'),
        ]);

        expect(manipulator.position).toBe(0);

        manipulator.next();

        expect(manipulator.position).toBe(1);
    });

    it('should fail to seek a position before the beginning of the children list', () => {
        const manipulator = new NodeManipulator([JsonPrimitiveNode.of('foo')]);

        expect(() => manipulator.seek(-1)).toThrowWithMessage(
            Error,
            'The position is out of bounds.',
        );
    });

    it('should fail to seek a position beyond the children list length', () => {
        const manipulator = new NodeManipulator([JsonPrimitiveNode.of('foo')]);

        expect(() => manipulator.seek(1)).toThrowWithMessage(
            Error,
            'The position is out of bounds.',
        );
    });

    it('should move the iterator to a valid position in the children list', () => {
        const firstNode = JsonPrimitiveNode.of('foo');
        const secondNode = JsonPrimitiveNode.of('bar');

        const manipulator = new NodeManipulator([
            firstNode,
            secondNode,
        ]);

        manipulator.seek(1);

        expect(manipulator.current).toBe(secondNode);

        manipulator.seek(0);

        expect(manipulator.current).toBe(firstNode);
    });

    it('should fail to move to the previous node at the beginning of the list', () => {
        const manipulator = new NodeManipulator([]);

        expect(() => manipulator.previous()).toThrowWithMessage(
            Error,
            'The iterator is at the beginning of the list.',
        );
    });

    it('should move to the previous node in the children list', () => {
        const firstNode = JsonPrimitiveNode.of('foo');
        const secondNode = JsonPrimitiveNode.of('bar');

        const manipulator = new NodeManipulator([
            firstNode,
            secondNode,
        ]);

        manipulator.seek(1);

        manipulator.previous();

        expect(manipulator.current).toBe(firstNode);
    });

    it('should fail to access the current node at the end of the list', () => {
        const manipulator = new NodeManipulator([]);

        expect(() => manipulator.current).toThrowWithMessage(
            Error,
            'The iterator is at the end of the list.',
        );
    });

    it('should not match any previous node at the beginning of the list', () => {
        const manipulator = new NodeManipulator([
            new JsonTokenNode({
                type: JsonTokenType.BRACE_LEFT,
                value: '{',
            }),
            new JsonTokenNode({
                type: JsonTokenType.BRACE_RIGHT,
                value: '}',
            }),
        ]);

        expect(manipulator.matchesPreviousToken(JsonTokenType.BRACE_LEFT)).toBeFalse();
    });

    it('should return false when the previous node does not match the specified token type', () => {
        const manipulator = new NodeManipulator([
            new JsonTokenNode({
                type: JsonTokenType.BRACE_LEFT,
                value: '{',
            }),
            new JsonTokenNode({
                type: JsonTokenType.BRACE_RIGHT,
                value: '}',
            }),
        ]);

        manipulator.next();

        expect(manipulator.matchesPreviousToken(JsonTokenType.STRING)).toBeFalse();
    });

    it('should return false when the previous node is not a token node', () => {
        const manipulator = new NodeManipulator([
            JsonPrimitiveNode.of('foo'),
            JsonPrimitiveNode.of('bar'),
        ]);

        manipulator.next();

        expect(manipulator.matchesPreviousToken(JsonTokenType.STRING)).toBeFalse();
    });

    it('should return true when the previous node matches the specified token type', () => {
        const manipulator = new NodeManipulator([
            new JsonTokenNode({
                type: JsonTokenType.BRACE_LEFT,
                value: '{',
            }),
            new JsonTokenNode({
                type: JsonTokenType.BRACE_RIGHT,
                value: '}',
            }),
        ]);

        manipulator.next();

        expect(manipulator.matchesPreviousToken(JsonTokenType.BRACE_LEFT)).toBeTrue();
    });

    it('should return true when the current node matches the specified node ignoring insignificant nodes', () => {
        const primitiveNode = JsonPrimitiveNode.of('foo');

        const manipulator = new NodeManipulator([
            new JsonTokenNode({
                type: JsonTokenType.WHITESPACE,
                value: ' ',
            }),
            new JsonTokenNode({
                type: JsonTokenType.NEWLINE,
                value: '\n',
            }),
            new JsonTokenNode({
                type: JsonTokenType.LINE_COMMENT,
                value: '// comment',
            }),
            new JsonTokenNode({
                type: JsonTokenType.BLOCK_COMMENT,
                value: '/* block comment */',
            }),
            primitiveNode,
        ]);

        expect(manipulator.matches(primitiveNode)).toBeTrue();
    });

    it('should return false when the current node does not match the specified node', () => {
        const manipulator = new NodeManipulator([
            JsonPrimitiveNode.of('foo'),
            JsonPrimitiveNode.of('bar'),
        ]);

        expect(manipulator.matches(JsonPrimitiveNode.of('baz'))).toBeFalse();
    });

    it('should return true when the current node matches the specified the token type', () => {
        const manipulator = new NodeManipulator([
            new JsonTokenNode({
                type: JsonTokenType.WHITESPACE,
                value: ' ',
            }),
        ]);

        expect(manipulator.matchesToken(JsonTokenType.WHITESPACE)).toBeTrue();
    });

    it('should return false when the current node does not match the specified the token type', () => {
        const manipulator = new NodeManipulator([
            new JsonTokenNode({
                type: JsonTokenType.WHITESPACE,
                value: ' ',
            }),
        ]);

        expect(manipulator.matchesToken(JsonTokenType.STRING)).toBeFalse();
    });

    it('should return true when the next node satisfies the given matcher', () => {
        const targetNode = JsonPrimitiveNode.of('foo');

        const manipulator = new NodeManipulator([
            new JsonTokenNode({
                type: JsonTokenType.WHITESPACE,
                value: ' ',
            }),
            targetNode,
        ]);

        const matcher = (node: JsonNode): boolean => node.isEquivalent(targetNode);

        expect(manipulator.matchesNext(matcher, NodeMatcher.WHITESPACE)).toBeTrue();
    });

    it('should return false when the next node does not satisfy the given matcher', () => {
        const targetNode = JsonPrimitiveNode.of('foo');

        const manipulator = new NodeManipulator([
            new JsonTokenNode({
                type: JsonTokenType.WHITESPACE,
                value: ' ',
            }),
            JsonPrimitiveNode.of('bar'),
        ]);

        const matcher = (node: JsonNode): boolean => node.isEquivalent(targetNode);

        expect(manipulator.matchesNext(matcher, NodeMatcher.WHITESPACE)).toBeFalse();
    });

    it('should find the next node that satisfies the matcher', () => {
        const targetNode = JsonPrimitiveNode.of('foo');
        const manipulator = new NodeManipulator([
            new JsonTokenNode({
                type: JsonTokenType.WHITESPACE,
                value: ' ',
            }),
            new JsonTokenNode({
                type: JsonTokenType.NEWLINE,
                value: '\n',
            }),
            targetNode,
        ]);

        const matcher = (node: JsonNode): boolean => node.isEquivalent(targetNode);

        expect(manipulator.findNext(matcher, NodeMatcher.SPACE)).toBe(2);
    });

    it('should return -1 when no node in the sequence satisfies the matcher', () => {
        const manipulator = new NodeManipulator([
            new JsonTokenNode({
                type: JsonTokenType.WHITESPACE,
                value: ' ',
            }),
            new JsonTokenNode({
                type: JsonTokenType.NEWLINE,
                value: '\n',
            }),
        ]);

        const matcher = (node: JsonNode): boolean => node.isEquivalent(JsonPrimitiveNode.of('foo'));

        expect(manipulator.findNext(matcher, NodeMatcher.WHITESPACE)).toBe(-1);
    });

    it('should replace the current node and advance to the next node', () => {
        const tokenNode = new JsonTokenNode({
            type: JsonTokenType.WHITESPACE,
            value: ' ',
        });

        const manipulator = new NodeManipulator([
            new JsonTokenNode({
                type: JsonTokenType.WHITESPACE,
                value: ' ',
            }),
        ]);

        expect(manipulator.current).not.toBe(tokenNode);

        manipulator.token(tokenNode);

        manipulator.seek(0);

        expect(manipulator.current).toBe(tokenNode);
    });

    it('should insert a insignificant token node if it does not exist and is not optional', () => {
        const tokenNode = new JsonTokenNode({
            type: JsonTokenType.WHITESPACE,
            value: ' ',
        });

        const manipulator = new NodeManipulator([]);

        manipulator.token(tokenNode);

        manipulator.seek(0);

        expect(manipulator.current).toBe(tokenNode);
    });

    it('should not insert an insignificant token node if it does not exist and is optional', () => {
        const tokenNode = new JsonTokenNode({
            type: JsonTokenType.WHITESPACE,
            value: ' ',
        });
        const manipulator = new NodeManipulator([]);

        manipulator.token(tokenNode, true);

        expect(manipulator.done()).toBeTrue();
    });

    it('should replace a mandatory token node', () => {
        const targetNode = new JsonTokenNode({
            type: JsonTokenType.STRING,
            value: 'bar',
        });

        const manipulator = new NodeManipulator([
            new JsonTokenNode({
                type: JsonTokenType.STRING,
                value: 'foo',
            }),
            new JsonTokenNode({
                type: JsonTokenType.STRING,
                value: 'bar',
            }),
            new JsonTokenNode({
                type: JsonTokenType.STRING,
                value: 'bar',
            }),
        ]);

        manipulator.token(targetNode, false);

        manipulator.seek(2);

        expect(manipulator.current).toStrictEqual(targetNode);
    });

    it('should replace an optional token node', () => {
        const targetNode = new JsonTokenNode({
            type: JsonTokenType.STRING,
            value: 'bar',
        });

        const manipulator = new NodeManipulator([
            new JsonTokenNode({
                type: JsonTokenType.STRING,
                value: 'foo',
            }),
            new JsonTokenNode({
                type: JsonTokenType.STRING,
                value: 'bar',
            }),
            new JsonTokenNode({
                type: JsonTokenType.STRING,
                value: 'bar',
            }),
        ]);

        manipulator.token(targetNode, false);

        manipulator.seek(2);

        expect(manipulator.current).toStrictEqual(targetNode);
    });

    it('should replace a node and advance to the next node', () => {
        const node = JsonPrimitiveNode.of('foo');
        const manipulator = new NodeManipulator([
            JsonPrimitiveNode.of('foo'),
        ]);

        manipulator.node(node);

        manipulator.seek(0);

        expect(manipulator.current).toBe(node);
    });

    it('should insert a node if it does not exist and is not optional', () => {
        const node = JsonPrimitiveNode.of('foo');
        const manipulator = new NodeManipulator([]);

        manipulator.node(node);

        manipulator.seek(0);

        expect(manipulator.current).toBe(node);
    });

    it('should not insert a node if it does not exist and is optional', () => {
        const manipulator = new NodeManipulator([]);

        manipulator.node(JsonPrimitiveNode.of('foo'), true);

        expect(manipulator.nodeList).toBeEmpty();
    });

    it('should accommodate a node without replacing any existing node', () => {
        const node = new JsonPropertyNode({
            key: JsonPrimitiveNode.of('foo'),
            value: JsonPrimitiveNode.of(NaN),
        });

        const manipulator = new NodeManipulator([
            JsonPrimitiveNode.of('foo'),
            JsonPrimitiveNode.of('bar'),
        ]);

        manipulator.node(node, false);

        expect(manipulator.nodeList).toStrictEqual([
            node,
            JsonPrimitiveNode.of('foo'),
            JsonPrimitiveNode.of('bar'),
        ]);
    });

    it('should match and replace a list matching a single node', () => {
        const node = JsonPrimitiveNode.of('foo');
        const manipulator = new NodeManipulator([
            JsonPrimitiveNode.of('foo'),
        ]);

        manipulator.nodes([node]);

        manipulator.seek(0);

        expect(manipulator.current).toBe(node);
    });

    it('should match and replace single non-primitive nodes', () => {
        const manipulator = new NodeManipulator([
            JsonArrayNode.of(1),
        ]);

        manipulator.nodes([
            JsonArrayNode.of(3),
        ]);

        expect(manipulator.nodeList).toStrictEqual([JsonArrayNode.of(3)]);
    });

    it('should not match and replace a list matching multiple nodes', () => {
        const firstNode = JsonPrimitiveNode.of('foo');
        const secondNode = JsonPrimitiveNode.of('bar');

        const manipulator = new NodeManipulator([
            JsonPrimitiveNode.of('foo'),
            JsonPrimitiveNode.of('bar'),
        ]);

        manipulator.nodes([firstNode, secondNode]);

        expect(manipulator.nodeList.length).toBe(2);

        manipulator.seek(0);

        expect(manipulator.current).not.toBe(firstNode);

        manipulator.seek(1);

        expect(manipulator.current).not.toBe(secondNode);
    });

    it('should insert nodes if it does not exist and is not optional', () => {
        const node = JsonPrimitiveNode.of('foo');
        const manipulator = new NodeManipulator([]);

        manipulator.nodes([node]);

        manipulator.seek(0);

        expect(manipulator.current).toBe(node);
    });

    it('should not insert nodes if it does not exist and is optional', () => {
        const node = JsonPrimitiveNode.of('foo');
        const manipulator = new NodeManipulator([]);

        manipulator.nodes([node], true);

        expect(manipulator.nodeList).toBeEmpty();
    });

    it('should insert a node in the current position', () => {
        const firstNode = JsonPrimitiveNode.of('foo');
        const secondNode = JsonPrimitiveNode.of('bar');
        const thirdNode = JsonPrimitiveNode.of('baz');
        const fourthNode = JsonPrimitiveNode.of('qux');

        const manipulator = new NodeManipulator([firstNode, fourthNode]);

        manipulator.seek(1);

        manipulator.insert(secondNode);

        manipulator.seek(2);

        manipulator.insert(thirdNode);

        expect(manipulator.nodeList).toStrictEqual([
            firstNode,
            secondNode,
            thirdNode,
            fourthNode,
        ]);
    });

    it('should remove the current node', () => {
        const firstNode = JsonPrimitiveNode.of('foo');
        const secondNode = JsonPrimitiveNode.of('bar');
        const thirdNode = JsonPrimitiveNode.of('baz');
        const fourthNode = JsonPrimitiveNode.of('qux');

        const manipulator = new NodeManipulator([
            firstNode,
            secondNode,
            secondNode,
            thirdNode,
            thirdNode,
            fourthNode,
        ]);

        manipulator.seek(1);

        manipulator.remove();

        manipulator.seek(3);

        manipulator.remove();

        expect(manipulator.nodeList).toStrictEqual([
            firstNode,
            secondNode,
            thirdNode,
            fourthNode,
        ]);
    });

    it('should drop nodes until a matching node is found', () => {
        const targetNode = JsonPrimitiveNode.of('bar');
        const whitespace = new JsonTokenNode({
            type: JsonTokenType.WHITESPACE,
            value: ' ',
        });

        const manipulator = new NodeManipulator([
            JsonPrimitiveNode.of('foo'),
            targetNode,
            whitespace,
        ]);

        const matcher = (node: JsonNode): boolean => node.isEquivalent(targetNode);

        expect(manipulator.dropUntil(matcher)).toBeTrue();

        expect(manipulator.nodeList).toStrictEqual([
            targetNode,
            whitespace,
        ]);
    });

    it('should not drop insignificant nodes until a significant node is found', () => {
        const insignificantNodes = [
            new JsonTokenNode({
                type: JsonTokenType.WHITESPACE,
                value: ' ',
            }),
            new JsonTokenNode({
                type: JsonTokenType.NEWLINE,
                value: '\n',
            }),
        ];

        const targetNode = JsonPrimitiveNode.of('bar');

        const initialList = [
            ...insignificantNodes,
            targetNode,
        ];

        const manipulator = new NodeManipulator([...initialList]);

        const matcher = (node: JsonNode): boolean => node.isEquivalent(targetNode);

        expect(manipulator.dropUntil(matcher)).toBeTrue();

        expect(manipulator.nodeList).toStrictEqual(initialList);
    });

    it('should drop all nodes if no matching node is found', () => {
        const manipulator = new NodeManipulator([
            JsonPrimitiveNode.of('foo'),
            new JsonTokenNode({
                type: JsonTokenType.WHITESPACE,
                value: ' ',
            }),
            JsonPrimitiveNode.of('bar'),
        ]);

        const matcher = (node: JsonNode): boolean => node.isEquivalent(JsonPrimitiveNode.of('baz'));

        expect(manipulator.dropUntil(matcher)).toBeFalse();

        expect(manipulator.nodeList).toBeEmpty();
    });

    it('should drop nothing if there are no nodes left', () => {
        const manipulator = new NodeManipulator([]);

        const matcher = (node: JsonNode): boolean => node.isEquivalent(JsonPrimitiveNode.of('foo'));

        expect(manipulator.dropUntil(matcher)).toBeFalse();

        expect(manipulator.done()).toBeTrue();
    });

    it('should preserve spacing before the target node when dropping nodes', () => {
        const targetNode = JsonPrimitiveNode.of('bar');
        const manipulator = new NodeManipulator([
            new JsonTokenNode({
                type: JsonTokenType.WHITESPACE,
                value: ' ',
            }),
            new JsonTokenNode({
                type: JsonTokenType.NEWLINE,
                value: '\n',
            }),
            targetNode,
            new JsonTokenNode({
                type: JsonTokenType.WHITESPACE,
                value: ' ',
            }),
        ]);

        const matcher = (node: JsonNode): boolean => node.isEquivalent(targetNode);

        expect(manipulator.dropUntil(matcher)).toBeTrue();
        expect(manipulator.current).toBe(targetNode);

        manipulator.next();

        expect(manipulator.nodeList).toStrictEqual([
            new JsonTokenNode({
                type: JsonTokenType.WHITESPACE,
                value: ' ',
            }),
            new JsonTokenNode({
                type: JsonTokenType.NEWLINE,
                value: '\n',
            }),
            targetNode,
            new JsonTokenNode({
                type: JsonTokenType.WHITESPACE,
                value: ' ',
            }),
        ]);
    });

    it('should preserve leading comments when dropping nodes', () => {
        const targetNode = new JsonPropertyNode({
            children: [],
            key: JsonPrimitiveNode.of('baz'),
            value: JsonPrimitiveNode.of('qux'),
        });
        const manipulator = new NodeManipulator([
            new JsonTokenNode({
                type: JsonTokenType.BRACE_LEFT,
                value: '{',
            }),
            new JsonTokenNode({
                type: JsonTokenType.NEWLINE,
                value: '\n',
            }),
            new JsonTokenNode({
                type: JsonTokenType.BLOCK_COMMENT,
                value: '/* comment */',
            }),
            new JsonTokenNode({
                type: JsonTokenType.NEWLINE,
                value: '\n',
            }),
            new JsonTokenNode({
                type: JsonTokenType.WHITESPACE,
                value: '   ',
            }),
            new JsonPropertyNode({
                key: JsonPrimitiveNode.of('foo'),
                value: JsonPrimitiveNode.of('baz'),
            }),
            new JsonTokenNode({
                type: JsonTokenType.NEWLINE,
                value: '\n',
            }),
            new JsonTokenNode({
                type: JsonTokenType.WHITESPACE,
                value: '   ',
            }),
            targetNode,
            new JsonTokenNode({
                type: JsonTokenType.NEWLINE,
                value: '\n',
            }),
            new JsonTokenNode({
                type: JsonTokenType.BRACE_RIGHT,
                value: '}',
            }),
        ]);

        const matcher = (node: JsonNode): boolean => node.isEquivalent(targetNode);

        expect(manipulator.dropUntil(matcher)).toBeTrue();
        expect(manipulator.current).toBe(targetNode);
        expect(manipulator.position).toBe(3);

        expect(manipulator.nodeList).toStrictEqual([
            new JsonTokenNode({
                type: JsonTokenType.BLOCK_COMMENT,
                value: '/* comment */',
            }),
            new JsonTokenNode({
                type: JsonTokenType.NEWLINE,
                value: '\n',
            }),
            new JsonTokenNode({
                type: JsonTokenType.WHITESPACE,
                value: '   ',
            }),
            targetNode,
            new JsonTokenNode({
                type: JsonTokenType.NEWLINE,
                value: '\n',
            }),
            new JsonTokenNode({
                type: JsonTokenType.BRACE_RIGHT,
                value: '}',
            }),
        ]);
    });

    it('should remove all remaining nodes', () => {
        const list = [
            JsonPrimitiveNode.of('foo'),
            JsonPrimitiveNode.of('bar'),
        ];

        const manipulator = new NodeManipulator(list);

        manipulator.end();

        expect(manipulator.done()).toBeTrue();
        expect(list).toBeEmpty();
    });

    it('should remove all insignificant nodes', () => {
        const manipulator = new NodeManipulator([JsonPrimitiveNode.of('foo')]);

        manipulator.nodes([
            new JsonTokenNode({
                type: JsonTokenType.WHITESPACE,
                value: ' ',
            }),
            new JsonTokenNode({
                type: JsonTokenType.NEWLINE,
                value: '\n',
            }),
        ]);

        manipulator.end();

        expect(manipulator.done()).toBeTrue();

        expect(manipulator.nodeList).toBeEmpty();
    });

    it('should remove all significant tokens', () => {
        const manipulator = new NodeManipulator([
            new JsonTokenNode({
                type: JsonTokenType.NUMBER,
                value: '1',
            }),
        ]);

        manipulator.nodes([
            JsonPrimitiveNode.of('foo'),
        ]);

        manipulator.end();

        expect(manipulator.done()).toBeTrue();

        expect(manipulator.nodeList).toStrictEqual([JsonPrimitiveNode.of('foo')]);
    });
});
