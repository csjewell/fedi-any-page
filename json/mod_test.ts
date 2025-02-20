import { assertEquals } from '@std/assert'
import { assertSnapshot } from '@std/testing/snapshot'
import { describe, it } from '@std/testing/bdd'
import { AP } from 'activitypub-core-types'
import { parse, stringify } from './mod.ts'

/*
Deno.test(function addTest() {
  assertEquals(add(2, 3), 5);
});
*/

let person: unknown
const jsonPerson = `
{
  "@context": [
    "https://www.w3.org/ns/activitystreams",
    "https://w3id.org/security/v1",
    {
      "manuallyApprovesFollowers": "as:manuallyApprovesFollowers",
      "toot": "http://joinmastodon.org/ns#",
      "featured": {
        "@id": "toot:featured",
        "@type": "@id"
      },
      "featuredTags": {
        "@id": "toot:featuredTags",
        "@type": "@id"
      },
      "alsoKnownAs": {
        "@id": "as:alsoKnownAs",
        "@type": "@id"
      },
      "movedTo": {
        "@id": "as:movedTo",
        "@type": "@id"
      },
      "schema": "http://schema.org#",
      "PropertyValue": "schema:PropertyValue",
      "value": "schema:value",
      "discoverable": "toot:discoverable",
      "suspended": "toot:suspended",
      "memorial": "toot:memorial",
      "indexable": "toot:indexable",
      "attributionDomains": {
        "@id": "toot:attributionDomains",
        "@type": "@id"
      },
      "focalPoint": {
        "@container": "@list",
        "@id": "toot:focalPoint"
      }
    }
  ],
  "id": "https://mastodon.example/users/CSJewell",
  "type": "Person",
  "following": "https://mastodon.example/users/CSJewell/following",
  "followers": "https://mastodon.example/users/CSJewell/followers",
  "inbox": "https://mastodon.example/users/CSJewell/inbox",
  "outbox": "https://mastodon.example/users/CSJewell/outbox",
  "featured": "https://mastodon.example/users/CSJewell/collections/featured",
  "featuredTags": "https://mastodon.example/users/CSJewell/collections/tags",
  "preferredUsername": "CSJewell",
  "name": "CSJewell",
  "summary": "<p>I&#39;m working on my own fediverse-attached blog.</p>",
  "url": "https://mastodon.example/@CSJewell",
  "manuallyApprovesFollowers": false,
  "discoverable": true,
  "indexable": true,
  "published": "2025-02-07T00:00:00Z",
  "memorial": false,
  "publicKey": {
    "id": "https://mastodon.example/users/CSJewell#main-key",
    "owner": "https://mastodon.example/users/CSJewell",
    "publicKeyPem": "-----BEGIN PUBLIC KEY-----\\n...\\n...\\n...\\n...\\n...\\n...\\n...\\n-----END PUBLIC KEY-----\\n"
  },
  "tag": [],
  "attachment": [],
  "endpoints": {
    "sharedInbox": "https://mastodon.example/inbox"
  },
  "image": {
    "type": "Image",
    "mediaType": "image/jpeg",
    "url": "https://files.mastodon.example/accounts/headers/123/456/original/milkaholic.jpeg"
  }
}
`

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
