#!/bin/sh

cd packages/database-cloudflare-d1
pnpm publish --access public --tag next --no-git-checks
cd ../../packages/database-mock
pnpm publish --access public --tag next --no-git-checks
cd ../../packages/eslint-config
pnpm publish --access public --tag next --no-git-checks
cd ../../packages/general
pnpm publish --access public --tag next --no-git-checks
cd ../../packages/handlers-response
pnpm publish --access public --tag next --no-git-checks
cd ../../packages/localserver-hapi
pnpm publish --access public --tag next --no-git-checks
cd ../../packages/types
pnpm publish --access public --tag next --no-git-checks
exit 0

