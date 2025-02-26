// SPDX-License-Identifier: MIT
// import { assertEquals } from '@std/assert'
import { assertSnapshot } from '@std/testing/snapshot'
import { describe, it } from '@std/testing/bdd'
// import { AP } from 'activitypub-core-types'
import { parse, stringify } from './mod.ts'

let jsonPerson: string
try {
  jsonPerson = await Deno.readTextFile('test_data/person.json')
} catch (error) {
  if (error instanceof Deno.errors.NotFound) {
    jsonPerson = await Deno.readTextFile('json/test_data/person.json')
  } else {
    // otherwise re-throw
    throw error
  }
}

let person: unknown
const actorTests = describe('Encoding and decoding an Actor')

try {
  person = parse(jsonPerson)
} catch (_caught) {
  // Not worrying about it.
}

it(actorTests, 'Parse a Person correctly', async function (t): Promise<void> {
  await assertSnapshot(t, person)
})

it(actorTests, 'Roundtrip test', async function (t): Promise<void> {
  const json = stringify(person)
  await assertSnapshot(t, json)
})
