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
const v = format('v%s', version)

console.info(v.match(/\d{1,3}-(alpha|beta|rc)\.\d{1,3}$/) === null ? 'latest' : 'next')
