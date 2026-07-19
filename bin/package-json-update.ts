#!/usr/bin/env -S node --experimental-strip-types

import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/* eslint func-style: ["error", "declaration"] */

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function stripTrailingCommas(text: string): string {
  return text.replaceAll(/,(\s*[\]}])/g, '$1')
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...target, }

  for (const [ key, sourceValue ] of Object.entries(source)) {
    const targetValue = result[key]

    if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
      result[key] = deepMerge(targetValue, sourceValue)
    } else {
      result[key] = sourceValue
    }
  }

  return result
}

function findPackageJsonFiles(dir: string): Array<string> {
  const results: Array<string> = []

  for (const entry of readdirSync(dir, { withFileTypes: true, })) {
    if (entry.name === 'node_modules') { continue }
    const fullPath = join(dir, entry.name)

    if (entry.isDirectory()) {
      results.push(...findPackageJsonFiles(fullPath))
    } else if (entry.name === 'package.json') {
      results.push(fullPath)
    }
  }

  return results
}

const templatePath = resolve(root, '.config/template.package.json')
const template = JSON.parse(
  stripTrailingCommas(readFileSync(templatePath, 'utf-8')),
) as Record<string, unknown>

const packagesDir = resolve(root, 'packages')
const packageJsonFiles = findPackageJsonFiles(packagesDir)

for (const filePath of packageJsonFiles) {
  const pkg = JSON.parse(readFileSync(filePath, 'utf-8')) as Record<string, unknown>
  const merged = deepMerge(pkg, template)

  writeFileSync(filePath, `${ JSON.stringify(merged, null, 2)  }\n`)
  const rel = filePath.replace(`${ root  }/`, '')

  /* eslint-disable-next-line no-console */
  console.log(`Updated: ${ rel }`)
}
