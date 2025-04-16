# Development

After installing Git and [installing pnpm](https://pnpm.io/installation):

```shell
git clone https://git.sr.ht/~csjewell/fedi-any-page
cd fedi-any-page
pnpm install
```

You do not NEED to create a fork in order to send a pull request, because
"Pull Requests" as Github implements them are not a thing SourceHub does.
Instead, you submit a patch or series of patches to a mailing list - in
this case, [the fedi-any-page-devel mailing list](https://lists.sr.ht/~csjewell/fedi-any-page-devel).
To subscribe to it, send an e-mail to `~csjewell/fedi-any-page-devel+subscribe@lists.sr.ht`
and follow the directions it gives you. To send an e-mail to it once you
have subscribed, the address is ~csjewell/fedi-any-page-devel@lists.sr.ht .

Please read the ettiquete directions linked from the mailing list's web page.

See [git-send-email.io] in order to get yourself set up to use git in an
e-mail-centric fashion. Read through it again, especially [step 4](https://git-send-email.io/#step-4).

If you see a patch series on the mailing list that you wish to reply to -
feel free to. That's part of the reason it's a public mailing list - anybody
can contribute to the discussion. Just remember that the [code of conduct](https://csjewell.github.io/activitypub-ts-dev/docs/code-of-conduct/)
applies to the mailing list, and I prefer not needing to wield a ban hammer.

## Building

Run [**tsup**](https://tsup.egoist.dev) locally to build source files from `src/` into output files in `lib/`:

```shell
pnpm build
```

Add `--watch` to run the builder in a watch mode that continuously cleans and recreates `lib/` as you save files:

```shell
pnpm build --watch
```

## License headers

The license in this repository is MIT, as a rule, with configuration files
set to CC0. Copyright is not claimed on most configuration or other generated
files. JavaScript and TypeScript files should have a license and copyright
header stating so. JSON, YAML, Markdown, html, and generated files should
be mentioned in REUSE.toml, instead.

We validate against the REUSE specification on push if Docker or
Podman is available.

## Linting amd formatting

This package includes several forms of linting to enforce consistent code quality and styling.
Each should be shown in VS Code, and can be run manually on the command-line:

- `pnpm lint` ([ESLint](https://eslint.org) with [typescript-eslint](https://typescript-eslint.io)): Lints JavaScript and TypeScript source files

Read the individual documentation for each linter to understand how it can be configured and used best.

For example, ESLint can be run with `--fix` to auto-fix some lint rule complaints:

```shell
pnpm lint --fix
```

## Type Checking

You should be able to see suggestions from [TypeScript](https://typescriptlang.org) in your editor for all open files.

However, it can be useful to run the TypeScript command-line (`tsc`) to type check all files in `src/`:

```shell
pnpm tsc
```

Add `--watch` to keep the type checker running in a watch mode that updates the display as you save files:

```shell
pnpm tsc --watch
```

## Sending patches

