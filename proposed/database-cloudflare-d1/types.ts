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

type LinkProperties = {
  height?    : number
  href?      : URL
  hrefLang?  : string
  mediaType? : string
  name?      : string
  nameMap?   : AP.StringReferenceMap
  preview?   : AP.OrArray<AP.EntityReference>
  rel?       : AP.OrArray<string>
  width?     : number
}

type Link = AP.BaseEntity<'Link'> & LinkProperties | AP.BaseEntity<'Mention'> & LinkProperties

export type DBDocument = {
//  object   : AP.CoreObject | undefined
  object: AP.ExtendedObject | AP.Actor | AP.Activity | AP.BaseEntity<'Collection'> & AP.CoreObjectProperties & {
    totalItems?   : number
    items?        : AP.OrArray<AP.EntityReference>
    startIndex?   : number
    orderedItems? : AP.OrArray<AP.EntityReference>
    current?      : URL | AP.CollectionPage | Link
    first?        : URL | AP.CollectionPage | Link
    last?         : URL | AP.CollectionPage | Link
  } | AP.OrderedCollection | AP.EitherCollectionPage | undefined
  objectId : number | undefined
}

export type DBDocumentInfo = {
  doc   : string
  r2key : string
  r2int : number
  url   : string
}
