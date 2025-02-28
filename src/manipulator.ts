import {JsonTokenType} from './token';
import {JsonNode, JsonTokenNode, JsonValueNode} from './node';

export type NodeMatcher = (node: JsonNode) => boolean;

/**
 * @internal
 */
export namespace NodeMatcher {
    export const ANY: NodeMatcher = () => true;

    export const NONE: NodeMatcher = () => false;

    export const SIGNIFICANT: NodeMatcher = node => !INSIGNIFICANT(node);

    export const INSIGNIFICANT: NodeMatcher = node => SPACE(node) || COMMENT(node);

    export const SPACE: NodeMatcher = node => WHITESPACE(node) || NEWLINE(node);

    export const WHITESPACE: NodeMatcher = node => (
        node instanceof JsonTokenNode
        && node.type === JsonTokenType.WHITESPACE
    );

    export const NEWLINE: NodeMatcher = node => (
        node instanceof JsonTokenNode
        && node.type === JsonTokenType.NEWLINE
    );

    export const COMMENT: NodeMatcher = node => LINE_COMMENT(node) || BLOCK_COMMENT(node);

    export const LINE_COMMENT: NodeMatcher = node => (
        node instanceof JsonTokenNode
        && node.type === JsonTokenType.LINE_COMMENT
    );

    export const BLOCK_COMMENT: NodeMatcher = node => (
        node instanceof JsonTokenNode
        && node.type === JsonTokenType.BLOCK_COMMENT
    );

    export const PUNCTUATION: NodeMatcher = node => (
        node instanceof JsonTokenNode
        && [
            JsonTokenType.COLON,
            JsonTokenType.COMMA,
            JsonTokenType.BRACE_LEFT,
            JsonTokenType.BRACE_RIGHT,
            JsonTokenType.BRACKET_LEFT,
            JsonTokenType.BRACKET_RIGHT,
        ].includes(node.type)
    );
}

export class NodeManipulator {
    /**
     * The list of nodes.
     */
    private readonly list: JsonNode[];

    /**
     * The current position of the iterator, zero-based.
     */
    private index = 0;

    /**
     * Whether the list is currently in fixing mode.
     *
     * This flag is set to true after mismatches and set to false after matches.
     */
    private fixing = false;

    public constructor(children: JsonNode[]) {
        this.list = children;
    }

    public done(): boolean {
        return this.index >= this.list.length;
    }

    public next(): void {
        if (this.done()) {
            throw new Error('The iterator is at the end of the list.');
        }

        this.index++;
    }

    public get position(): number {
        return this.index;
    }

    public seek(position: number): void {
        if (position < 0 || position >= this.list.length) {
            throw new Error('The position is out of bounds.');
        }

        this.index = position;
    }

    public previous(): void {
        if (this.index === 0) {
            throw new Error('The iterator is at the beginning of the list.');
        }

        this.index--;
    }

    public get current(): JsonNode {
        if (this.done()) {
            throw new Error('The iterator is at the end of the list.');
        }

        return this.list[this.index];
    }

    public get values(): JsonNode[] {
        return this.list;
    }

    public matchesPreviousToken(type: JsonTokenType): boolean {
        if (this.index === 0) {
            return false;
        }

        const previous = this.list[this.index - 1];

        return previous instanceof JsonTokenNode && previous.type === type;
    }

    public matches(node: JsonNode): boolean {
        return this.findMatch([node]) >= 0;
    }

    public matchesToken(type: JsonTokenType): boolean {
        return this.matchesNext(
            current => current instanceof JsonTokenNode && current.type === type,
            NodeMatcher.NONE,
        );
    }

    public matchesNext(matcher: NodeMatcher, skipped?: NodeMatcher): boolean {
        return this.findNext(matcher, skipped) >= 0;
    }

    public findNext(matcher: NodeMatcher, skipper: NodeMatcher = NodeMatcher.INSIGNIFICANT): number {
        let matchIndex = -1;
        const previousPosition = this.index;

        while (!this.done()) {
            const {current} = this;

            if (matcher(current)) {
                matchIndex = this.index;

                break;
            }

            if (skipper(current)) {
                this.next();

                continue;
            }

            break;
        }

        this.index = previousPosition;

        return matchIndex;
    }

    public token(token: JsonTokenNode, $optional = false): this {
        return this.nodes([token], $optional);
    }

    public node(node: JsonNode, $optional = false): this {
        return this.nodes([node], $optional);
    }

    public nodes(nodes: JsonNode[], optional = false): this {
        const index = this.findMatch(nodes);

        if (index >= 0) {
            if (nodes.length === 1) {
                // If there's a single node, replace the matching node
                // with the given node
                this.seek(index);
                this.remove();
                this.insert(nodes[0]);
            } else {
                // Advance to the next node after the match
                this.seek(index + 1);
            }

            this.fixing = false;
        } else if (!optional) {
            this.fixing = true;
            this.accommodate(nodes[0]);
        }

        return this;
    }

    public insert(node: JsonNode): this {
        this.list.splice(this.index, 0, node);

        this.next();

        return this;
    }

    public remove(): this {
        this.list.splice(this.index, 1);

        return this;
    }

    public dropUntil(matcher: NodeMatcher): boolean {
        let fixing = false;
        const startIndex = this.index;

        while (!this.done()) {
            const node = this.current;

            if (matcher(node)) {
                if (fixing) {
                    this.fixSpacing(startIndex);
                }

                return true;
            }

            if (!(node instanceof JsonTokenNode) || NodeMatcher.SIGNIFICANT(node)) {
                this.remove();

                fixing = true;

                continue;
            }

            if (!fixing || node.type === JsonTokenType.WHITESPACE) {
                this.next();

                continue;
            }

            this.fixSpacing(startIndex);

            fixing = false;
        }

        if (fixing) {
            this.fixSpacing(startIndex);
        }

        return false;
    }

    public end(): this {
        this.dropUntil(NodeMatcher.NONE);

        if (!this.fixing) {
            // Preserve the trailing spaces the previous node matched
            return this;
        }

        while (this.index > 0) {
            this.previous();

            const node = this.current;

            if (NodeMatcher.INSIGNIFICANT(node)) {
                // Stop if the previous node is a space
                this.remove();

                continue;
            }

            this.next();

            break;
        }

        return this;
    }

    private findMatch(nodes: JsonNode[]): number {
        return this.findNext(
            current => nodes.some(node => current?.isEquivalent(node)),
            NodeMatcher.INSIGNIFICANT,
        );
    }

    private fixSpacing(startIndex: number): void {
        const currentToken = this.done() ? null : this.current;

        let removalCount = 0;

        while (this.index > startIndex) {
            this.previous();

            const node = this.current;

            // Stop if the previous node is not a whitespace
            if (!NodeMatcher.WHITESPACE(node)) {
                this.next();

                break;
            }

            removalCount++;
        }

        const previousToken = this.list[this.index - 1] ?? null;

        if (currentToken !== null) {
            if (
                (previousToken === null && NodeMatcher.SPACE(currentToken))
                || (
                    removalCount > 0
                    && (
                        ((NodeMatcher.BLOCK_COMMENT)(previousToken) && NodeMatcher.PUNCTUATION(currentToken))
                        || ((NodeMatcher.BLOCK_COMMENT)(currentToken) && NodeMatcher.PUNCTUATION(previousToken))
                    )
                )
            ) {
                removalCount++;
            } else if (NodeMatcher.NEWLINE(previousToken) && NodeMatcher.NEWLINE(currentToken)) {
                removalCount++;
                this.previous();
            } else if (!NodeMatcher.NEWLINE(currentToken)) {
                removalCount--;

                this.next();
            }
        }

        while (removalCount-- > 0) {
            this.remove();
        }
    }

    private accommodate(node: JsonNode): void {
        if (NodeMatcher.INSIGNIFICANT(node)) {
            this.insert(node);

            return;
        }

        if (!this.done()) {
            const index = this.findNext(current => NodeManipulator.isReplacement(current, node));

            if (index >= 0) {
                this.seek(index);
                this.remove();
                this.fixing = false;
            }
        }

        this.insert(node);
    }

    private static isReplacement(previousNode: JsonNode, currentNode: JsonNode): boolean {
        if (currentNode instanceof JsonTokenNode || previousNode instanceof JsonTokenNode) {
            return previousNode.isEquivalent(currentNode);
        }

        if (currentNode instanceof JsonValueNode && previousNode instanceof JsonValueNode) {
            return true;
        }

        return previousNode.constructor === currentNode.constructor;
    }
}
