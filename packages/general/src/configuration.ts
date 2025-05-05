/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import type * as AP from '@csjewell-activitypub/types'
import type * as Database from './database/mod.ts'

/**
 * Defines an abstract configuration class, to be implemented by modules that
 * implement using a particular database.
 *
 * @typeParam DatabaseT - The type of the database's low-level handle
 * @typeParam SessionReturnT - TODOCUMENT
 */
export type Configuration<DatabaseT> = {
  /** The main URL of the site */
  url      : URL
  /** The name of the site */
  siteName : string
  /** An instance of the database's Router class. */
  database : Database.Router<DatabaseT>
  /** Whether to show debugging information about the database */
  debugDB? : boolean

  /** Retrieves a pre-generated ActivityPub document object */
  localGet        : (url: string | URL) => AP.OrPromise<AP.CoreObject | undefined>
  /** Gets the URL for an actor based on a username */
  getActorURL     : (username: string) => string
  /** Gets an identifier based on a username */
  getActorBasedId : (username: string, ending: string) => string
}
