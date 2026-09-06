# ESLint options for @csjewell-activitypub

[![libera manifesto](https://img.shields.io/badge/libera-manifesto-lightgrey.svg)](https://liberamanifesto.com)
[![🤝 Code of Conduct: Kept](https://img.shields.io/badge/%F0%9F%A4%9D_code_of_conduct-kept-21bb42.svg)](https://codefloe.com/CSJewell/fedi-any-page/src/branch/dev/docs/CODE_OF_CONDUCT.md)
[![📝 License: MIT](https://img.shields.io/badge/%F0%9F%93%9D_license-MIT-21bb42.svg)](https://codefloe.com/CSJewell/fedi-any-page/src/branch/dev/LICENSES/MIT.txt)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
![💪 TypeScript: Strict](https://img.shields.io/badge/%F0%9F%92%AA_typescript-strict-21bb42.svg)
[![JSR](https://jsr.io/badges/@csjewell-activitypub/eslint-config?style=plastic)](https://jsr.io/@csjewell-activitypub/eslint-config)
[![NPM](https://img.shields.io/npm/v/%40csjewell-activitypub%2Feslint-config.svg)](https://npmjs.com/package/@csjewell-activitypub/eslint-config)

## Usage

```shell
pnpm install -D @csjewell-activitypub/eslint-config
```

```ts
// eslint.config.js
import { config } from 'typescript-eslint';
import { Config } from '@csjewell-activitypub/eslint-config'
import { fileURLToPath } from 'node:url'

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url))

export default config(
  { ignores: ['lib', 'node_modules', 'pnpm-lock.yaml'] },
  Config(gitignorePath),
);
```

## Development

See the documentation on [how to contribute](https://fedi-any-page.curtisjewell.dev/docs/contributing/).
Thanks! 💖
