import type {JsonArray, JsonObject, JsonPrimitive, JsonValue} from '@croct/json';
import {JsonArrayNode} from './arrayNode';
import {JsonObjectNode} from './objectNode';
import {
    type JsonBooleanNode,
    type JsonNullNode,
    type JsonNumberNode,
    type JsonStringNode,
    JsonPrimitiveNode,
} from './primitiveNode';
import {JsonValueNode} from './valueNode';

export namespace JsonValueFactory {
    type JsonValueFactories = {
        array: (value: JsonArray) => JsonArrayNode,
        object: (value: JsonObject) => JsonObjectNode,
        primitive: (value: JsonPrimitive) => JsonPrimitiveNode,
    };

    const factories: JsonValueFactories = {} as JsonValueFactories;

    export function register<K extends keyof JsonValueFactories>(type: K, factory: JsonValueFactories[K]): void {
        factories[type] = factory;
    }

    export function create(value: JsonArray|JsonArrayNode): JsonArrayNode;
    export function create(value: JsonObject|JsonObjectNode): JsonObjectNode;
    export function create(value: string|JsonStringNode): JsonStringNode;
    export function create(value: number|JsonNumberNode): JsonNumberNode;
    export function create(value: boolean|JsonBooleanNode): JsonBooleanNode;
    export function create(value: null|JsonNullNode): JsonNullNode;
    export function create(value: JsonPrimitive|JsonPrimitiveNode): JsonPrimitiveNode;
    export function create(value: JsonValue|JsonValueNode): JsonValueNode;

    export function create(value: JsonValue|JsonValueNode): JsonValueNode {
        if (value instanceof JsonValueNode) {
            return value;
        }

        if (Array.isArray(value)) {
            return factories.array(value);
        }

        if (typeof value === 'object' && value !== null) {
            return factories.object(value);
        }

        return factories.primitive(value);
    }
}
