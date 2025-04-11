/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { type Configuration, type Database, NotImplementedError } from '@csjewell-activitypub/general'
import { CloudflareD1Database } from './router.ts'
import type { D1Database } from '@cloudflare/workers-types'
import type * as AP from '@csjewell-activitypub/types'

/**
 * Implements the configuration required in order to connect a Cloudflare D1 database
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
export class CloudflareConfig implements Configuration<D1Database, unknown> {
  public readonly url        : URL
  public readonly privateKey : string
  public readonly database   : Database.Router<D1Database, unknown>
  public readonly siteName   : string = ''
  // private readonly pattern   : string = ''
  public debugDb = false

  constructor(env: Record<string, unknown>, mapping: Record<string, string>) {
    this.url = new URL(env[mapping.url] as string)
    this.privateKey = ''
    this.database = new CloudflareD1Database(this, env[mapping.database] as D1Database)
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
