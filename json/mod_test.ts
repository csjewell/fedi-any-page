// SPDX-License-Identifier: MIT
//import { assertEquals } from '@std/assert'
import { assertSnapshot } from '@std/testing/snapshot'
import { describe, it } from '@std/testing/bdd'
import { AP } from 'activitypub-core-types'
import { parse, stringify } from './mod.ts'

let person: unknown
const jsonPerson = await Deno.readTextFile("test_data/person.json");
const actorTests = describe('Encoding and decoding an Actor')

try {
  person = parse(jsonPerson)
} catch (caught) {}

it(actorTests, 'Parse a Person correctly', async function (t): Promise<void> {
  await assertSnapshot(t, person)
})

it(actorTests, 'Roundtrip test', async function (t): Promise<void> {
  const json = stringify(person)
  await assertSnapshot(t, json)
})
