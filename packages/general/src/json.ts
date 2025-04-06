/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
/**
 * This module contains helpers to stringify and parse JSON that represents an ActivityPub document.
 *
 * ```ts
 * import * as AP from 'jsr:@csjewell-activitypub/types'
 * import * as Json from 'jsr:@csjewell-activitypub/json'
 *
 * const headers = new Headers({
 *   'User-Agent': 'ActivityPubTypeScript/0.1.0',
 *   'Accept': 'application/activity+json',
 * })
 * const activityPubObject = <AP.Actor>Json.parse(await
 *   fetch('https://activitypub.example/users/potus', { headers }).then((resp) => {
 *     resp.text()
 *   })
 * )
 * ```
 *
 * @module Json
 */
import * as Json from '@hyperjump/json'
import type * as AP from '@csjewell-activitypub/types'

type OrArray<T> = T | Array<T>

const desiredEntityReference = (value: OrArray<string>): OrArray<AP.EntityReference> => {
  if (typeof value === 'string') {
    return (new URL(value)) as AP.EntityReference
  }

  return value.map(x => new URL(x) as AP.EntityReference)
}

type ContextInEntry = string | Record<string, unknown>
type ContextOutEntry = URL | Record<string, unknown>

const oneContext = (value: ContextInEntry): ContextOutEntry => {
  if (typeof value === 'string') {
    return new URL(value)
  }

  return value
}

/*
function desiredContext(value: Array<ContextInEntry>): Array<ContextOutEntry> {
  return value.map(x => oneContext(x))
}
*/

const reviver = (key: string, value: unknown, pointer: string): unknown => {
  // console.log(`REVIVER: "${pointer}", "${key}":`, value)
  const keysAreURLs = [ 'id', 'url' ]
  const pointersAreURLs = [
    '/following',
    '/followers',
    '/inbox',
    '/outbox',
    '/featured',
    '/featuredTags',
    '/publicKey/owner',
    '/endpoints/sharedInbox',
  ]

  if (keysAreURLs.includes(key)) {
    return new URL(value as string)
  }

  if (pointersAreURLs.includes(pointer)) {
    return new URL(value as string)
  }

  switch (key) {
    case '@context': {
      return Array.isArray(value)
        ? value.map(x => oneContext(x as ContextInEntry))
        : oneContext(value as ContextInEntry)
    }

    // EntityReference fields
    case 'attachment':
    case 'attributedTo':
    case 'audience':
    case 'bcc':
    case 'bto':
    case 'cc':
    case 'context':
    case 'generator':
    case 'inReplyTo':
    case 'location':
    case 'preview':
    case 'tag':
    case 'to': {
      return Array.isArray(value)
        ? desiredEntityReference(value as Array<string>)
        : desiredEntityReference(value as string)
    }

    /*
    // Identity fields
    case 'content':
    case 'duration':
    case 'mediaType':
    case 'name':
    case 'summary':
    // Boolean, but should read as such.
    case 'sensitive':
    // String reference maps. They're an identity field.
    case 'contentMap':
    case 'nameMap':
    case 'summaryMap': {
      return value
    }
    */

    // Dates
    case 'endTime':
    case 'published':
    case 'startTime':
    case 'updated': {
      return new Date(value as string)
    }

    /*
    // Fun stuff...
    icon?: OrArray<ImageReference | LinkReference>;
    image?: OrArray<ImageReference | LinkReference>;
    url?: OrArray<LinkReference>;

    replies?: CollectionReference;
    likes?: OrderedCollectionReference;
    shares?: OrderedCollectionReference;
    */

    default: {
      return value
    }
  }
}

const replacer = (_key: string, value: unknown, _pointer: string): unknown => {
  // console.log(`REPLACER: "${pointer}", "${key}":`, value)

  if (value instanceof URL) {
    return value.toString()
  }

  if (value instanceof Date) {
    return value.toJSON()
  }

  return value
}

/**
 * Returns a JSON document based on the value passed in (defined as an
 * `unknown`, but really an `AP.` type or a `Record<string, any>`.)
 *
 * @param value The value to be stringified
 * @returns The JSON document
 */

export const stringify = (value: unknown): string => {
  return Json.stringify(value, replacer)
}

/**
 * Returns an ActivityPub document as an `unknown` which can be cast into
 * the appropriate type.
 *
 * @param value A JSON document.
 * @returns An object representing an ActivityPub document.
 */

export const parse = (value: string): unknown => {
  return Json.parse(value, reviver)
}
