# Contributing

There are two *blessed* branches: `dev` and `release`.

Please create pull requests off of `dev`. They will be merged back into `dev`.

When a release is ready, it will be made by a fast-forward merge from `dev` into
`release`.

## How to release

```
... (dev +=)$ git commit
... (dev>)$ git push
... (dev $=)$ git checkout release
... (release $%=)$ git merge --ff origin/dev
... (release $=)$ git tag v0.1.0-alpha.3
... (release $=)$ git push --tags
... (release $=)$ git checkout dev
```
