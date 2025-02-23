import {JsonValue} from '@croct/json';
import {JsonValueNode} from './valueNode';
import {JsonNode} from './node';
import {JsonTokenNode} from './tokenNode';
import {JsonTokenType} from '../token';
import {JsonCompositeDefinition, JsonCompositeNode, PartialJsonCompositeDefinition} from './compositeNode';
import {NodeManipulator} from '../manipulator';
import {JsonValueFactory} from './factory';
import {JsonIdentifierNode} from './identifierNode';
import {isIdentifier} from '../identifier';
import {JsonPrimitiveNode, JsonStringNode} from './primitiveNode';
import {Formatting} from '../formatting';

export interface JsonPropertyDefinition extends JsonCompositeDefinition {
    readonly key: JsonStringNode | JsonIdentifierNode;
    value: JsonValueNode;
}

export class JsonPropertyNode extends JsonCompositeNode implements JsonPropertyDefinition {
    public readonly key: JsonStringNode | JsonIdentifierNode;

    public value: JsonValueNode;

    public constructor(definition: PartialJsonCompositeDefinition<JsonPropertyDefinition>) {
        super(definition);

        this.key = definition.key;
        this.value = definition.value;
    }

    public reset(): void {
        this.key.reset();
        this.value.reset();

        this.children.length = 0;
    }

    public set(value: JsonValue | JsonValueNode): void {
        this.value = JsonValueFactory.create(value);
    }

    public rebuild(formatting?: Formatting): void {
        this.value.rebuild(formatting);

        const quote = formatting?.property?.quote;
        const spaced = formatting?.object?.colonSpacing ?? false;

        const manipulator = new NodeManipulator(this.children);

        let {key} = this;

        if (manipulator.matches(this.key)) {
            key.rebuild();
        } else {
            key = this.formatKey(formatting);

            key.rebuild({
                ...formatting,
                string: {
                    quote: quote === 'single' || quote === 'double'
                        ? quote
                        : formatting?.string?.quote,
                },
            });
        }

        manipulator.node(key);

        manipulator.token(
            new JsonTokenNode({
                type: JsonTokenType.COLON,
                value: ':',
            }),
        );

        if (spaced) {
            manipulator.token(
                new JsonTokenNode({
                    type: JsonTokenType.WHITESPACE,
                    value: ' ',
                }),
                !manipulator.done(),
            );
        }

        manipulator.node(this.value)
            .end();
    }

    private formatKey(formatting?: Formatting): JsonStringNode | JsonIdentifierNode {
        if (
            this.key instanceof JsonPrimitiveNode
            && formatting?.property?.unquoted === true
            && isIdentifier(this.key.value)
        ) {
            return JsonIdentifierNode.of(this.key.value);
        }

        return this.key;
    }

    public clone(): JsonPropertyNode {
        return new JsonPropertyNode({
            key: this.key,
            value: this.value,
            children: this.children.map(child => child.clone()),
            location: this.location,
        });
    }

    public isEquivalent(other: JsonNode): boolean {
        if (!(other instanceof JsonPropertyNode)) {
            return false;
        }

        return this.key.isEquivalent(other.key)
            && this.value.isEquivalent(other.value);
    }
}
