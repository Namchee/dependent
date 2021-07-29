# Dependent

[![NPM package version](https://img.shields.io/npm/v/namchee/dependent)](https://www.npmjs.com/package/@namchee/dependent) [![Code Style: Google](https://img.shields.io/badge/code%20style-google-blueviolet.svg)](https://github.com/google/gts) ![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg) ![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/github/namchee/telepon)

Dependent is a simple utility CLI to find out which files in your JavaScript project is using a certain dependency. 🚀

## Why?

Say, you want to uninstall some dependency since it is not needed anymore in file `x`. You proceed to execute `npm uninstall x`, the uninstallation completed successfully, and then you continue the development. Sadly, you realized that `x` is actually imported by another files. Your project now breaks by your careless mistake.

The above scenario is fine for small projects since they are easier to test and execute (and compile, if you're using a superset of JavaScript). But, what about big projects where it took so long to execute and compile? What about dynamic imports in not-fully-tested projects where the code may fail silently? This utility aims to fix those issues.

Another use case is for new team member so they can analyze why and where a dependency is needed so the onboarding process can go faster.

## Features

- Parse JS files in your project.
- Path configuration with `[files...]` argument.
- Failsafe parsing with `silent` argument.
- ESM and CommonJS compatibility.

## Installation

You can install it globally with your favorite package manager. Below is the example of installation with `npm`.

```bash
npm install -g @namchee/dependent
```

## Usage

> The utility can be executed either with `dependent` or `deps`.

```bash
dependent <package> [files...]

Positionals:
  package, p  Package name to be analyzed.                              [string]
  files, f    Files to be analyzed in glob pattern relative to the current
              project directory.                              [string] [default:
          ["!(node_modules)/**/*.js","!(node_modules)/**/*.mjs","*.js","*.mjs"]]

Options:
      --help     Show help                                             [boolean]
      --version  Show version number                                   [boolean]
  -m, --module   Parse all files as ES module files                    [boolean]
  -r, --require  Parse all files as JS scripts                         [boolean]
  -s, --silent   Skip all unreadable and unparseable files instead of throwing
                 errors                               [boolean] [default: false]
  -t, --table    Print the output in table format     [boolean] [default: false]
```

## License

This project is licensed under the [MIT License](./LICENSE).
