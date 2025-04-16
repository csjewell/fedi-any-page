ESLint options for @csjewell-activitypub

[![libera manifesto](https://img.shields.io/badge/libera-manifesto-lightgrey.svg)](https://liberamanifesto.com)
[![🤝 Code of Conduct: Kept](https://img.shields.io/badge/%F0%9F%A4%9D_code_of_conduct-kept-21bb42.svg)](https://git.sr.ht/~csjewell/fedi-any-page/tree/dev/item/docs/CODE_OF_CONDUCT.md)
[![📝 License: MIT](https://img.shields.io/badge/%F0%9F%93%9D_license-MIT-21bb42.svg)](https://git.sr.ht/~csjewell/fedi-any-page/tree/dev/item/LICENSES/MIT.txt)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
![💪 TypeScript: Strict](https://img.shields.io/badge/%F0%9F%92%AA_typescript-strict-21bb42.svg)
[![JSR](https://jsr.io/badges/@csjewell-activitypub/eslint-config?style=plastic)](https://jsr.io/@csjewell-activitypub/eslint-config)
[![NPM](https://img.shields.io/npm/v/%40csjewell-activitypub%2Feslint-config.svg)](https://npmjs.com/package/@csjewell-activitypub/eslint-config)

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

See the documentation on [how to contribute](https://csjewell.github.io/activitypub-ts-kit/docs/contributing).
Thanks! 💖
