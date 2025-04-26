# Release checklist

When a release is ready, it will be made by a fast-forward merge from `dev` into
`release`.

Note that each release is tagged, and those tags are pushed up.

## Before releasing

These commands should be performed before pushing up the last commit before
the release.

```bash
... (dev +=)$ pnpm lint
... (dev +=)$ pnpm -r build
... (dev +=)$ pnpm test
... (dev +=)$ git commit
... (dev>)$ pnpx jsr publish --dry-run
... (dev>)$ pnpm publish --recursive --tag next --dry-run
... (dev>)$ git push origin; git push github
```

## How to release

To actually DO the release, follow these directions.

```bash
... (dev $=)$ git checkout release
... (release $%=)$ git merge --ff origin/dev
... (release $%=)$ git push origin; git push github
... (release $=)$ git tag `bin/get_current_version.js`
... (release $=)$ git push origin --tags; git push github --tags
... (release $=)$ git checkout dev
... (dev $=)$ pnpm bumpp
[hack, hack, hack...]
```
