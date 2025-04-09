/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import type * as AP from '@csjewell-activitypub/types'

export type DBId = {
  id : number
}

export type DBCount = {
  count : number
}

export type DBDocument = {
  object   : AP.CoreObject | undefined
  objectId : number | undefined
}

export type DBDocumentInfo = {
  doc   : string
  r2key : string
  r2int : number
  url   : string
}
