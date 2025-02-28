import {JsonParser, JsonArrayNode, JsonValueNode, Formatting} from '../src';

describe('Functional test', () => {
    type ManipulationScenario<T extends JsonValueNode = JsonValueNode> = {
        description: string,
        input: string,
        output: string,
        type: new (definition: any) => T,
        mutation: (node: T) => void,
        format?: Formatting,
    };

    it.each<ManipulationScenario>([
        {
            description: 'preserve leading inline comments',
            // language=JSON5
            input: multiline`
              [1, 2]
            `,
            // language=JSON5
            output: multiline`
              [1, 2]
            `,
            type: JsonArrayNode,
            mutation: (node: JsonArrayNode): void => {
                node.delete(1);
            },
        },
    ])('should $description', ({input, output, type, mutation, format}) => {
        const node = JsonParser.parse(input, type);

        mutation(node);

        expect(node.toString(format)).toBe(output);
    });

    function multiline(strings: TemplateStringsArray): string {
        const lines = strings.join('').split('\n');

        if (lines.length < 2) {
            return strings.join('');
        }

        const indent = lines[1].search(/\S/);

        return lines
            .map(line => line.slice(indent))
            .join('\n')
            .trim();
    }
});
