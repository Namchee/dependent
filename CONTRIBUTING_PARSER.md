# Contributing to Parser Support

As already known, `dependent` relies heavily on its parsing capabilities to support multitude of files. The currently supported files are documented in the [readme](./README.md) file. Other than any supported files, `dependent` cannot parse those files correctly and any attempt to parse those files will produce an error.

If you feel that a particular file extension should be supported by `dependent`, you can [submit an issue](https://github.com/Namchee/dependent/issues/new?assignees=&labels=enhancement&template=language-support.md&title=feat%28lang%29%3A+) ...or you can contribute to add language support directly to `dependent`!

For starters, please read the [contribution guidelines](./CONTRIBUTING.md) until you have successfully setup `dependent` in your local machine.

## Code Structure

All parsers are stored in `src/parser/<ext>.ts` where `<ext>` is the supported file extension (e.g: `ts.ts` is a parser for TypeScript files). All parsers must be provided as a TypeScript file.

All parsers must export at least one function which satisfies the following TypeScript type definition.

```ts
export type FileParser = (
  content: string,
  dependency: string,
) => number[];
```

Where `content` is the content of an analyzed file and `dependency` is the name of dependency which will be checked. Full details of the type can be seen in [`types.ts`](./src/types.ts).

If the parsed `content` is structured in [ESTree](https://github.com/estree/estree) `Node` or similar data structure, it's preferable that a different function is used to parse the `Node` itself rather than bundling it in a single exported function. For example:

```ts
export function parseNode(
  sourceNode: Node,
  dependency: string,
): number[] {
  const lines: number[] = [];

  simple(sourceNode, {
    ImportExpression(node: Node) {
      const importExpr = node as unknown as ImportExpression;

      if (
        importExpr.source.type === 'Literal' &&
        importExpr.source.value === dependency
      ) {
        lines.push((node.loc as SourceLocation).start.line);
      }
    },

    ImportDeclaration(node: Node) {
      const importDec = node as unknown as ImportDeclaration;

      if (
        importDec.source.type === 'Literal' &&
        importDec.source.value === dependency
      ) {
        lines.push((node.loc as SourceLocation).start.line);
      }
    },

    CallExpression(node: Node) {
      const callExpr = node as unknown as CallExpression;

      if (
        callExpr.callee.type === 'Identifier' &&
        callExpr.callee.name === 'require' &&
        callExpr.arguments[0].type === 'Literal' &&
        callExpr.arguments[0].value === dependency
      ) {
        lines.push((node.loc as SourceLocation).start.line);
      }
    },
  });

  return lines;
}

export function getESModulesImportLines(
  content: string,
  dependency: string,
): number[] {
  const node: Node = parse(content, {
    ecmaVersion: 'latest',
    locations: true,
    allowHashBang: true,
    sourceType: 'module',
  });

  return parseNode(node, dependency);
}
```

See all examples of parser [here](./src/parser).

After the main function is exported, you must register it on [`index.ts`](./src/parser/index.ts), specifically on `PARSER_MAP`, else the parser cannot be recognized by `dependent`. `PARSER_MAP` is a key-value map that stores file extension to their respective parser function. The following exmaple shows an example of registering `js` files to the `getESModulesImportLines` from the function above.

```ts
export const PARSER_MAP: Record<string, FileParser> = {
    // ...
    js: getESModulesImportLines,
    // ...
};
```

> In the future, it might be possible for `dependent` to automatically register parsers by itself.

## Testing

In order to guarantee the correctness of a parser, a unit test must be provided for each supported parsers. All tests must be provided as a TypeScript file and will be executed by `jest` with following command

```bash
yarn test
```

...or, use the `watch` version, which will rerun all of the tests if at least of the test dependencies changed

```bash
yarn test:watch
```

See [the test example](./__tests__/parser/mjs.test.ts) for how to structure a decent test for a parser.

> Please make sure that all tests must **pass** before submitting a pull request. Failed to comply to this rule will cause your pull request to be rejected.