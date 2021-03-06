# Contributing to Dependent

Hello there! We are very excited to hear that you are interested in contributing to this project. Before submitting your contribution, please make sure to take a moment and read through the following guide.

## Setup (locally)

This project uses [`yarn`](https://yarnpkg.com/) to manage project dependencies. If you don't have `yarn` installed in your machine, you can install it by executing the following command.

```bash
npm install -g yarn
```

After the installation completed successfully, test your `yarn` installation by executing the following command.

```bash
yarn --version
```

If the command is found, you have successfully installed `yarn` 🎉

Before contributing to anything, make sure that you have forked this repository. See [this guide](https://docs.github.com/en/get-started/quickstart/fork-a-repo) about how to fork a repository.

After you have forked the repository, you have to clone your forked repository to your machine. See [this guide](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository-from-github/cloning-a-repository) about how to clone a repository.

After you have cloned the repository, you have to install all the required project dependencies. Execute the following command in your terminal

```bash
yarn install
```

Congratulations! If you don't encounter any errors, you have succesfully set up this project locally on your machine 🎉

## Development

This project uses [TypeScript](https://www.typescriptlang.org/) on the top of JavaScript. To build this project, execute the following command in your terminal.

```bash
yarn build
```

To enable auto compilation on every code changes instead, execute the following command in your terminal

```bash
yarn build:watch
```

## Executing Dependent

There are two ways to try out `dependent` locally.

### Global Install

You can install the local copy of `dependent` from your machine by installing it globally with `yarn`. Execute the following command in your terminal

```bash
yarn global add $PWD
```

...or use the `npm` equivalent version of the command below

```bash
npm install --global .
```

Now, you can execute `dependent` globally in your machine. Sweet!

### Global Symlinks

If you don't like to pollute your global `npm` scripts. You can install `dependent` by creating a symlink to your local copy of `dependent`.

First, you have to setup a new NodeJS test project in your local machine. Then, install `dependent` on it by executing the following command.

```bash
yarn add -D @namchee/dependent
```

Then, navigate to your local copy of `dependent` and execute the following command.

```bash
npm link
```

After that, navigate back to your test project and execute the following command.

```bash
npm link @namchee/dependent
```

Now, any changes you have made in your local copy of `dependent` will be reflected on your test project.

Please refer to [this guide](https://docs.npmjs.com/cli/v7/commands/npm-link) for more information about symlinking.

### Project Structure

This project is structured with the following structure

```bash
src/
  parser/     # List of file parsers
    <ext>.ts  # Parser for all files with <ext> extension
  cli.ts      # CLI definition
  file.ts     # File scanner
  import.ts   # File parser
  index.ts    # Main entry point
  logger.ts   # Output generator
  package.ts  # Package checker
  types.ts    # TypeScript types definition
```

Please refer to [this guide](./CONTRIBUTING_PARSER.md) about extending parser support.

## Code Style

Please respect all the defined linter rules in this project.

All commit messages must be formatted in [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) format. If possible, append [gitmoji](https://gitmoji.dev/) to your commit messages.

## Thanks

Thank you again for being interested in this project! You are awesome!
