<p align="center">
    <a href="https://croct.com">
        <img src="https://cdn.croct.io/brand/logo/repo-icon-green.svg" alt="Croct" height="80"/>
    </a>
    <br />
    <strong>TypeScript Project Title</strong>
    <br />
    A brief description about the project.
</p>
<p align="center">
    <img alt="Build" src="https://img.shields.io/badge/build-passing-green" />
    <img alt="Coverage" src="https://img.shields.io/badge/coverage-100%25-green" />
    <img alt="Maintainability" src="https://img.shields.io/badge/maintainability-100-green" />
    <br />
    <br />
    <a href="https://github.com/croct-tech/repository-template-typescript/releases">📦 Releases</a>
    ·
    <a href="https://github.com/croct-tech/repository-template-typescript/issues/new?labels=bug&template=bug-report.md">🐞 Report Bug</a>
    ·
    <a href="https://github.com/croct-tech/repository-template-typescript/issues/new?labels=enhancement&template=feature-request.md">✨ Request Feature</a>
</p>

## Overview

This library provides an API for working with JSON and [JSON5](https://json5.org/) documents while preserving their original structure and formatting. 
Unlike traditional JSON parsers that use an Abstract Syntax Tree (AST) and discard formatting, this library leverages a Concrete Syntax Tree (CST) to retain every detail—comments, indentation, and whitespace.

Ideal for editing configuration files (e.g., `package.json`, `tsconfig.json`) or any user-generated JSON5 content, this library ensures that formatting remains intact throughout modifications.

### Key features

- **Preserve formatting** – Read, modify, and write JSON5 files without losing comments, indentation, or spacing.
- **Style learning** – Automatically applies the document's existing formatting style to new entries.
- **Reformatting** – Customize output formatting with flexible options.
- **Type Safety** – Fully typed API for working with JSON5 documents.

## Installation

Install via [NPM](https://www.npmjs.com):

```sh
npm install @croct/json5-parser
```

## Usage

The library provides a simple API for parsing, manipulating, and serializing JSON5 documents.

### Lexing

Usually, you don't need to interact with the lexer directly. However, you can use it to tokenize a JSON5 document:

```ts
import {JsonLexer} from '@croct/json5-parser';

const tokens = JsonLexer.tokenize(
    `{
        // Comment
        "name": "John Doe",
        "age": 42,
    }`
);
```

### Parsing

To parse a JSON5 document:

```ts
import {JsonParser} from '@croct/json5-parser';

const node = JsonParser.parse(
    `{
        // Comment
        "name": "John Doe",
        "age": 42,
    }`
);
```

Optionally, specify the expected root node type to narrow down the result:

```ts
import {JsonParser, JsonObjectNode} from '@croct/json5-parser';

const node = JsonParser.parse<JsonObjectNode>(
    `{
        // Comment
        "name": "John Doe",
        "age": 42,
    }`,
    JsonObjectNode
);
```

### Manipulation

Modify values while preserving formatting:

```ts
// Get the value of a property
const name = node.get('name').toJSON();

// Update a property
node.set('age', 43);

console.log(node.toString());
```

New entries adopt the document's existing style:

```ts
node.set('country', 'USA');

console.log(node.toString());
```

Output:

```json5
{
    // Comment
    "name": "John Doe",
    "age": 43,
    "country": "USA",
}
```

Formatting is applied at a block level, handling different styles within the same document:

```json5
{
  "name": "My Project",
  "version": "1.0.0",
  "keywords": ["json5", "parser"],
}
```

Adding an array entry keeps the existing format:

```ts
node.set('stack', ['react', 'typescript']);
```

Output:

```json5
{
  "name": "My Project",
  "version": "1.0.0",
  "keywords": ["json5", "parser"],
  "stack": ["react", "typescript"],
}
```

To reset formatting and apply a new style:

```ts
node.reset();

console.log(node.toString({ indentationLevel: 2 }));
```

Output:

```json5
{
  "name": "My Project",
  "version": "1.0.0",
  "keywords": [
    "json5",
    "parser"
  ],
  "stack": [
    "react",
    "typescript"
  ]
}
```

To update the document while preserving formatting, use the `update` method:

```ts

node.update({
    ...node.toJSON(),
    "version": "2.0.0",
});
```

The `update` method reconciles the new content with the existing document, preserving comments, indentation, and spacing.

## Contributing

Contributions are welcome!

- Report issues on the [issue tracker](https://github.com/croct-tech/project-ts/issues).
- For major changes, [open an issue](https://github.com/croct-tech/project-ts/issues) first to discuss.
- Ensure test coverage is updated accordingly.

## Testing

Install dependencies:

```sh
npm install
```

Run tests:

```sh
npm run test
```

Lint code to check for style issues:

```sh
npm run lint
```
