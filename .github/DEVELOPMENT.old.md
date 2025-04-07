# NOTE

This is being merged into DEVELOPMENT.md - what isn't merged into that
document does not apply here.

# Contributing to re-pliers

To check re-pliers out:

`git clone https://git.sr.ht/~csjewell/re-pliers`

(The repository on Github is a mirror for building purposes. Pull requests
are not accepted there.)

## To start coding

I prefer to use pnpm (so you see a pnpm-lock.yaml file at the root) instead of npm.

If this is your first TypeScript repository to work on, install these three things in order:

* [nvm](https://nvm.sh/)
* The latest version of Node.js: `nvm install node`
* [pnpm](https://pnpm.io/installation)

Then `pnpm install && pnpm prepare && pnpm dev:watch` will let you see what is happening so far.

## General Style Guide

First off, needs to be said: re-pliers [is ESM-only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).

One (of my two) major exceptions to what is said in that gist is that
I tend to prefer one of two options for importing:

```typescript
/* Importing multiple related things (usually functions) with no
 * default import.
 *
 * Should use the same "namespace" as the file being imported,
 * but appropriately capitalized.
 */
import * as MyAPI from './myapi.ts'

/* Importing one default thing, (component, type, etc.) with
 * one or two things related to the default thing
 */
import MyComponent from './mycomponent.ts'
import type MyType, { assertMyType } from '../types/mytype.ts'
```

This assists in tree-shaking by bundlers, and of course, is if an
external module supports it.

The other one being that the tooling I'm using supports using the
.ts file name, instead of the .js one.

Most code in re-pliers is in TypeScript, with the "style guide" being
what is enforced by eslint and git based on the configuration in the
root directory. Husky has a pre-push hook to make sure that tests are
passing before committing, as well as running eslint with options to
fix what can be fixed.

### License headers

The license in this repository is MIT, as a rule, with configuration files
set to CC0. Copyright is not claimed on most configuration or other generated
files. JavaScript and TypeScript files should have a license and copyright
header stating so. JSON, YAML, Markdown, html, and generated files should
be mentioned in REUSE.toml, instead.

We validate against the REUSE specification on push if Docker or
Podman is available.

### Style notes specific to re-pliers

Components should be functional, be in the `src/components/` directory,
and export the component by default (which means using the second style
of import specified above.)

Type definitions that are needed more than locally should be in the
`src/types` directory, should be exported as the default export, and
if being used to validate the return value of HTTP API's,
should also export functions to assert and validate the type.

