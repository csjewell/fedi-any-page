/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import * as Json from './json.ts'
import type * as AP from '@csjewell-activitypub/types'

const jsonPerson = readFileSync('test_data/person.json', { encoding: 'utf-8', })
let person: AP.Person

try {
  person = Json.parse<AP.Person>(jsonPerson)
} catch (_error) {
  // Not worrying about it.
}

describe('encoding and decoding an Actor', () => {
  it('parses a Person correctly', () => {
    expect(person).toMatchSnapshot()
  })

  it('matches when roundtripped', () => {
    const json = Json.stringify(person)

    expect(json).toMatchSnapshot()
  })
})
