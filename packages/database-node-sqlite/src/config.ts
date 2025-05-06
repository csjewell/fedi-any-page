/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { type Configuration, type Database, NotImplementedError } from '@csjewell-activitypub/general'
import { SQLiteDatabase } from './database.ts'
import type { Keyv } from 'keyv'
import type { DatabaseSync } from 'node:sqlite'
import type * as AP from '@csjewell-activitypub/types'

/**
 * Implements the configuration required in order to connect a SQLite database
 * to the ActivityPub toolkit.
 *
 * @example
 *  ```ts
 *  const config = new CloudflareConfig(env, {
 *    url: 'ACTIVITYPUB_URL',
 *    database: 'ACTIVITYPUB_DB',
 *  })
 *  ```
 *
 */
export class SQLiteConfig implements Configuration<DatabaseSync> {
  public readonly url        : URL
  public readonly privateKey : string
  public readonly database   : Database.Router<DatabaseSync>
  public readonly siteName   : string = ''
  // private readonly pattern   : string = ''
  public debugDb = false

  constructor(cache: Keyv, dbInfo: string | DatabaseSync) {
    this.url = new URL('http://test-db.localhost/')
    this.privateKey = ''
    this.database = new SQLiteDatabase(cache, dbInfo)
  }

  getActorURL = (_username: string): string => {
    throw new NotImplementedError()
  }

  getActorBasedId = (_username: string, _ending: string): string => {
    throw new NotImplementedError()
  }

  /* eslint-disable-next-line @typescript-eslint/require-await -- Not implemented yet */
  localGet = async (url: string | URL): Promise<AP.CoreObject | undefined> => {
    console.info(url)
    throw new NotImplementedError()
  }
}
