# Release checklist

When a release is ready, it will be made by a fast-forward merge from `dev` into
`release`.

Note that each release is tagged, and those tags are pushed up.

## Before releasing

These commands should be performed before pushing up the last commit before
the release.

```
... (dev +=)$ pnpm lint
... (dev +=)$ pnpm -r build
... (dev +=)$ pnpm test
... (dev +=)$ git commit
... (dev>)$ pnpx jsr publish --dry-run
... (dev>)$ pnpm publish --dry-run
... (dev>)$ git push
```

## How to release

To actually DO the release, follow these directions.

```
... (dev $=)$ git checkout release
... (release $%=)$ git merge --ff origin/dev
... (release $%=)$ git push
... (release $%=)$ git push origin
... (release $=)$ git tag v0.1.1-alpha.2
... (release $=)$ git push --tags
... (release $=)$ git checkout dev
... (dev $=)$ git push --tags
... (dev $=)$ pnpm bumpp
[hack, hack, hack...]
```
