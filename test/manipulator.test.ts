import {JsonArrayNode, JsonPrimitiveNode, JsonTokenNode, JsonTokenType} from '../src';
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
    it('should check whether the current node is the last of the children list', () => {
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

    it('should iterate to the next children node', () => {
        const firstNode = JsonPrimitiveNode.of('foo');
        const secondNode = JsonPrimitiveNode.of('bar');

        const manipulator = new NodeManipulator([
            firstNode,
            secondNode,
        ]);

        expect(manipulator.current).toBe(firstNode);

        manipulator.next();

        expect(manipulator.current).toBe(secondNode);
    });

    it('should fail to iterate to the next children node when all children were traversed', () => {
        const manipulator = new NodeManipulator([JsonPrimitiveNode.of('foo')]);

        manipulator.next();

        expect(() => manipulator.next()).toThrowWithMessage(
            Error,
            'The iterator is at the end of the list.',
        );
    });

    it('should get the node position', () => {
        const manipulator = new NodeManipulator([
            JsonPrimitiveNode.of('foo'),
            JsonPrimitiveNode.of('bar'),
        ]);

        expect(manipulator.position).toBe(0);

        manipulator.next();

        expect(manipulator.position).toBe(1);
    });

    it('should fail to seek a node at a position less than 0', () => {
        const manipulator = new NodeManipulator([JsonPrimitiveNode.of('foo')]);

        expect(() => manipulator.seek(-1)).toThrowWithMessage(
            Error,
            'The position is out of bounds.',
        );
    });

    it('should fail to seek a node at a position greater than the children list length', () => {
        const manipulator = new NodeManipulator([JsonPrimitiveNode.of('foo')]);

        expect(() => manipulator.seek(1)).toThrowWithMessage(
            Error,
            'The position is out of bounds.',
        );
    });

    it('should seek a node at a given position', () => {
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

    it('should fail to get the previous node when the current node is the first child', () => {
        const manipulator = new NodeManipulator([]);

        expect(() => manipulator.previous()).toThrowWithMessage(
            Error,
            'The iterator is at the beginning of the list.',
        );
    });

    it('should get the previous node', () => {
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

    it('should fail to get the current node when the iterator is at the end of the list', () => {
        const manipulator = new NodeManipulator([]);

        expect(() => manipulator.current).toThrowWithMessage(
            Error,
            'The iterator is at the end of the list.',
        );
    });
});
