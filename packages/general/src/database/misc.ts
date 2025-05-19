/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */

import type * as AP from '@csjewell-activitypub/types'

/** TODO: Document [2015-4-12] */
export type DBUsername = {
  username   : string | undefined
  usernameId : number | undefined
}

/** TODO: Document better [2015-5-19] */
export type DatabaseKey = {
  /** Creates a public/private key pair */
  createKey     : () => Promise<void>
  /** Retrieves the public key */
  getPublicKey  : () => AP.OrPromise<string>
  /** Retrieves the private key */
  getPrivateKey : () => AP.OrPromise<string>
  /** Does a key exist? */
  exists        : () => AP.OrPromise<boolean>
  /** Get the database id for the key */
  databaseId    : () => number | undefined
}
