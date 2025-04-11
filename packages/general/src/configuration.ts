/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import type * as AP from '@csjewell-activitypub/types'
import type * as Database from './database/mod.ts'

/**
 * Defines an abstract configuration class
 */
export type Configuration<DatabaseT, SessionReturnT> = {
  url        : URL
  privateKey : string
  database   : Database.Router<DatabaseT, SessionReturnT>
  debugDB?   : boolean
  siteName   : string

  /** Gets a pre-generated ActivityPub document object */
  localGet        : (url: string | URL) => AP.OrPromise<AP.CoreObject | undefined>
  /** Gets the URL for an actor based on a username */
  getActorURL     : (username: string) => string
  /** Gets an identifier based on a username */
  getActorBasedId : (username: string, ending: string) => string
}
