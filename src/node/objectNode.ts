import {JsonObject, JsonValue} from '@croct/json';
import {JsonValueNode} from './valueNode';
import {JsonNode} from './node';
import {JsonStructureNode, StructureDelimiter} from './structureNode';
import {JsonPropertyNode} from './propertyNode';
import {JsonCompositeDefinition, JsonCompositeNode, PartialJsonCompositeDefinition} from './compositeNode';
import {JsonPrimitiveNode, JsonStringNode} from './primitiveNode';
import {JsonValueFactory} from './factory';
import {JsonIdentifierNode} from './identifierNode';
import {JsonError} from '../error';

export interface JsonObjectDefinition extends JsonCompositeDefinition {
    readonly properties: readonly JsonPropertyNode[];
}

export class JsonObjectNode extends JsonStructureNode implements JsonCompositeDefinition {
    private readonly propertyNodes: JsonPropertyNode[];

    public constructor(definition: PartialJsonCompositeDefinition<JsonObjectDefinition>) {
        super(definition);

        this.propertyNodes = [...definition.properties];
    }

    public static of(properties: Record<string, JsonValueNode|JsonValue>): JsonObjectNode {
        return new JsonObjectNode({
            properties: Object.entries(properties).map(
                ([key, value]) => new JsonPropertyNode({
                    key: JsonPrimitiveNode.of(key),
                    value: JsonValueFactory.create(value),
                }),
            ),
        });
    }

    public update(other: JsonValueNode|JsonValue, merge = false): JsonValueNode {
        if (!(other instanceof JsonValueNode)) {
            if (typeof other !== 'object' || other === null || Array.isArray(other)) {
                return JsonValueFactory.create(other);
            }

            for (const [key, value] of Object.entries(other)) {
                if (value === undefined) {
                    this.delete(key);

                    continue;
                }

                const property = this.propertyNodes.find(current => current.key.toJSON() === key);

                if (property !== undefined) {
                    property.value = property.value.update(value);

                    continue;
                }

                this.set(key, value);
            }

            if (!merge) {
                for (const property of this.propertyNodes) {
                    const key = property.key.toJSON();

                    if (other[key] === undefined) {
                        this.delete(property.key.toJSON());
                    }
                }
            }

            return this;
        }

        if (!(other instanceof JsonObjectNode)) {
            return other;
        }

        for (const property of other.propertyNodes) {
            const index = this.propertyNodes.findIndex(current => current.key.toJSON() === property.key.toJSON());

            if (index >= 0) {
                const cloneProperty = this.propertyNodes[index].clone();

                cloneProperty.value = cloneProperty.value.update(property.value);
            } else {
                this.propertyNodes.push(property);
            }
        }

        if (!merge) {
            for (const property of this.propertyNodes) {
                const key = property.key.toJSON();

                if (!other.has(key)) {
                    this.delete(key);
                }
            }
        }

        return this;
    }

    protected getList(): JsonCompositeNode[] {
        return [...this.propertyNodes];
    }

    protected getDelimiter(): StructureDelimiter {
        return StructureDelimiter.OBJECT;
    }

    protected getMaxDepth(): number {
        return 2;
    }

    public has(name: string): boolean {
        return this.propertyNodes.some(current => current.key.toJSON() === name);
    }

    public get properties(): JsonPropertyNode[] {
        return [...this.propertyNodes];
    }

    public set(name: string|JsonStringNode|JsonIdentifierNode, value: JsonValue|JsonValueNode): void {
        const index = this.propertyNodes.findIndex(current => current.key.toJSON() === name);

        if (index >= 0) {
            this.propertyNodes[index].set(value);

            return;
        }

        this.propertyNodes.push(
            new JsonPropertyNode({
                key: typeof name === 'string' ? JsonPrimitiveNode.of(name) : name,
                value: JsonValueFactory.create(value),
            }),
        );
    }

    public delete(name: string): void {
        for (let index = 0; index < this.propertyNodes.length; index++) {
            const property = this.propertyNodes[index];

            if (property.key.toJSON() === name) {
                this.propertyNodes.splice(index, 1);

                break;
            }
        }
    }

    public get(name: string): JsonValueNode;

    public get<T extends JsonValueNode>(name: string, type: new (...args: any[]) => T): T;

    public get<T extends JsonValueNode>(name: string, type?: new (...args: any[]) => T): JsonNode {
        const property = this.propertyNodes.find(current => current.key.toJSON() === name);

        if (property === undefined) {
            throw new Error(`Property "${name}" does not exist.`);
        }

        const {value} = property;

        if (type !== undefined && !(value instanceof type)) {
            throw new JsonError(`Expected a value of type ${type.name}, but got ${value.constructor.name}`);
        }

        return value;
    }

    public clone(): JsonObjectNode {
        return new JsonObjectNode({
            properties: this.propertyNodes,
            children: this.children.map(child => child.clone()),
            location: this.location,
        });
    }

    public isEquivalent(other: JsonNode): boolean {
        if (!(other instanceof JsonObjectNode)) {
            return false;
        }

        if (this.properties.length !== other.properties.length) {
            return false;
        }

        const entries = Object.fromEntries(other.properties.map(property => [property.key.toJSON(), property]));

        return this.properties.every(property => entries[property.key.toJSON()]?.isEquivalent(property) === true);
    }

    public toJSON(): JsonObject {
        return Object.fromEntries(
            this.properties.map(
                property => [
                    property.key.toJSON(),
                    property.value.toJSON(),
                ],
            ),
        );
    }
}

JsonValueFactory.register(
    'object',
    object => new JsonObjectNode({
        properties: Object.entries(object).flatMap(
            ([propertyName, propertyValue]) => (
                propertyValue === undefined
                    ? []
                    : [
                        new JsonPropertyNode({
                            key: JsonPrimitiveNode.of(propertyName),
                            value: JsonValueFactory.create(propertyValue),
                        }),
                    ]
            ),
        ),
    }),
);
