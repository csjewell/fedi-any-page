# @csjewell-activitypub/commit-config

[![libera manifesto](https://img.shields.io/badge/libera-manifesto-lightgrey.svg)](https://liberamanifesto.com)
[![🤝 Code of Conduct: Kept](https://img.shields.io/badge/%F0%9F%A4%9D_code_of_conduct-kept-21bb42.svg)](https://codefloe.com/CSJewell/fedi-any-page/src/branch/dev/docs/CODE_OF_CONDUCT.md)
[![📝 License: MIT](https://img.shields.io/badge/%F0%9F%93%9D_license-MIT-21bb42.svg)](https://codefloe.com/CSJewell/fedi-any-page/src/branch/dev/LICENSES/MIT.txt)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
![💪 TypeScript: Strict](https://img.shields.io/badge/%F0%9F%92%AA_typescript-strict-21bb42.svg)

This implements a commitlint/commitizen setup that is halfway between
scopedcommits.com and conventionalcommits.org.

Specifically, I'm of the opinion that:

1. The type of commit that a conventional commit has, while good to know,
is better placed in a trailer than in a subject, while the scope is
important enough to be in the subject.
2. I use changesets to generate the changelog, as opposed to the git log.
See <https://keepachangelog.com/en/1.1.0/>

This is meant for use with the other @csjewell-activitypub packages, so while
it is set up as a package in the monorepo, it is not released as one. If
a release of this module is desired, raise an issue.

References:

<https://scopedcommits.com/>

<https://sumnerevans.com/posts/software-engineering/stop-using-conventional-commits/>
