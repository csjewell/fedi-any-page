#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import escalade from 'escalade'

const input = import.meta.dirname
const pkg = await escalade(input, (dir, names) => {
  if (names.includes('package.json')) {
    // will be resolved into absolute
    return 'package.json'
  }
})

const version = `v${ JSON.parse(readFileSync(pkg)).version }`
console.log(version);
