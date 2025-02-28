/* SPDX-License-Identifier: MIT */
import type { AP } from 'activitypub-core-types'

export type DBId = {
  id: number
}

export type DBCount = {
  count: number
}

export type DBDocument = {
  object: AP.CoreObject | undefined
  objectId: number | undefined
}

export type DBDocumentInfo = {
  doc: string
  r2key: string
  r2int: number
  url: string
}
