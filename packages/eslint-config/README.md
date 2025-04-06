# ESLint options for @csjewell-activitypub

[![libera manifesto](https://img.shields.io/badge/libera-manifesto-lightgrey.svg)](https://liberamanifesto.com)
[![🤝 Code of Conduct: Kept](https://img.shields.io/badge/%F0%9F%A4%9D_code_of_conduct-kept-21bb42)](https://github.com/csjewell/activitypub-ts-kit/blob/main/.github/CODE_OF_CONDUCT.md)
[![📝 License: MIT](https://img.shields.io/badge/%F0%9F%93%9D_license-MIT-21bb42.svg)](https://github.com/csjewell/activitypub-ts-kit/blob/main/LICENSES/MIT.txt)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
![💪 TypeScript: Strict](https://img.shields.io/badge/%F0%9F%92%AA_typescript-strict-21bb42.svg)

## Usage

```shell
pnpm install -D @csjewell-activitypub/eslint-config
```

```ts
import tseslint from 'typescript-eslint';
import Config from './src/index.ts';

export default tseslint.config(
  { ignores: ['lib', 'node_modules', 'pnpm-lock.yaml'] },
  { linterOptions: { reportUnusedDisableDirectives: 'error' } },
  Config(),
);
```

## Development

See [`.github/CONTRIBUTING.md`](../../.github/CONTRIBUTING.md), then [`.github/DEVELOPMENT.md`](../../.github/DEVELOPMENT.md).
Thanks! 💖
