/* SPDX-License-Identifier: MIT */
import sanitizeHtml from 'sanitize-html'
import { isTypeOf } from 'activitypub-core-types/lib/assertions/index.js'
import { CoreObjectTypes } from 'activitypub-core-types/lib/activitypub/utils/const.js'
import type { CoreObject, EntityReference } from 'activitypub-core-types/lib/activitypub/index.js'

interface ErrorOptions {
  cause?: Error
}

export class NotImplementedError extends Error {
  constructor(message: string = 'Not Implemented', options: ErrorOptions = {}) {
    super(message, options)
    this.name = 'NotImplementedError'
  }
}

/*
 */
export function getEntityId(
  er: string | EntityReference | Array<EntityReference> | URL | undefined,
): string | undefined {
  if (Array.isArray(er)) {
    return undefined
  }

  return entityRefToString(er)
}

/*
 */
export function getUsername(
  _er: string | EntityReference | Array<EntityReference> | URL | undefined,
): { username: string; usernameId: number } | undefined {
  if (Array.isArray(_er)) {
    return undefined
  }

  // TODO: Finish implementing, might not be here.
  return undefined
}

/*
 */
export function getDocument(
  dr: string | EntityReference | Array<EntityReference> | URL | undefined,
): CoreObject | undefined {
  if (Array.isArray(dr)) {
    return undefined
  }

  // TODO: Finish implementing, might not be here.
  return undefined
}

/*
 */
export function entityRefToString(er: string | URL | EntityReference | undefined): string | undefined {
  if (er === undefined || er === null) {
    return undefined
  }

  if (typeof er === 'string') {
    return er
  }

  if (isTypeOf(er as CoreObject, CoreObjectTypes)) {
    if ('id' in er) {
      if (er.id === null) {
        return undefined
      }

      return er.id!.toString()
    }

    return undefined
  }

  return (er as URL).toString()
}

/*
 */
export function entityRefToURL(er: string | URL | EntityReference | undefined): URL | undefined {
  if (er === undefined || er === null) {
    return undefined
  }

  if (typeof er === 'string') {
    let url: URL | undefined
    try {
      url = new URL(er)
    } catch (caught) {
      const typeCaught = caught as TypeError
      console.log(`Error in entityRefToURL: Could not create a URL: ${typeCaught.message}`)
    }

    return url
  }

  if (er instanceof URL) {
    return er
  }

  if (isTypeOf(er as CoreObject, CoreObjectTypes)) {
    if ('id' in er) {
      if (er.id === null) {
        return undefined
      }

      return er.id
    }

    return undefined
  }
}

/*
 */
export function isObjectOurs(
  host: string,
  er: EntityReference | Array<EntityReference> | string | URL | undefined,
): boolean {
  if (er === undefined || er === null) {
    return false
  }

  let isOurs = false

  if (Array.isArray(er)) {
    for (const x of er) {
      isOurs = isObjectOurs(host, x)
      if (isOurs) {
        break
      }
    }

    return isOurs
  }

  const erURL = entityRefToURL(er)
  if (erURL === null || erURL === undefined) {
    return false
  }

  return erURL.host === host
}

/*
 */
export function washHTML(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'p',
      'span',
      'b',
      'br',
      'code',
      'pre',
      'i',
      'u',
      'ul',
      'ol',
      'li',
      'blockquote',
      'em',
      'strong',
      'a',
      'abbr',
      'dfn',
    ],
    allowedAttributes: {
      a: ['href'],
      abbr: ['title'],
      p: ['style'],
      span: ['style'],
      dfn: ['title'],
    },
    allowedSchemes: ['http', 'https', 'ftp', 'mailto', 'tel', 'magnet'],
    allowedStyles: {
      '*': {
        // Match HEX and RGB
        color: [/^#(0x)?[\da-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
        'text-align': [/^left$/, /^right$/, /^center$/],
        // Match any number with px, em, or %
        'font-size': [/^\d+(?:px|em|%)$/],
        'font-weight': [/^[247]00$/],
      },
    },
    exclusiveFilter: function (frame: sanitizeHtml.IFrame): boolean {
      // Remove empty a tags.
      return frame.tag === 'a' && !frame.text.trim()
    },
    textFilter: function (text: string, tagName: string): string {
      if (['a'].includes(tagName)) {
        return text // Skip anchor tags
      }

      return text.replace(/\.{3}/, '&hellip;')
    },
    transformTags: {
      h1: 'strong',
      h2: 'strong',
      h3: 'strong',
      h4: 'strong',
      h5: 'strong',
      h6: 'strong',
      b: 'strong',
      i: sanitizeHtml.simpleTransform('span', { style: 'font-family: italic' }),
      ol: function (_tagName: string, _attribs: sanitizeHtml.Attributes): sanitizeHtml.Tag {
        // My own custom magic goes here
        return {
          tagName: 'ul',
          attribs: {
            class: 'foo',
          },
        }
      },
    },
    nestingLimit: 6,
  })
}
