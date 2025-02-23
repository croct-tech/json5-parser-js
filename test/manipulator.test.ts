import {JsonArrayNode, JsonTokenNode, JsonTokenType} from '../src';
import {NodeMatcher} from '../src/manipulator';

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
});

describe('NodeManipulator', () => {
});
