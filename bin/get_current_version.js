#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { format } from 'node:util'
import escalade from 'escalade'

const input = import.meta.dirname
const pkg = await escalade(input, (_dir, names) => {
  if (names.includes('package.json')) {
    // will be resolved into absolute
    return 'package.json'
  }

  return ''
})

const { version, } = JSON.parse(readFileSync(pkg))

console.info(format('v%s', version))
