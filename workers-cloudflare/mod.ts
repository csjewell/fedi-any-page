/* SPDX-License-Identifier: MIT */
import { NotImplementedError } from '@csjewell-activitypub/general/errors'
import type { default as Configuration } from '@csjewell-activitypub/general/configuration'
import type * as AP from '@csjewell-activitypub/types'
import type D1Database from '@cloudflare/workers-types'

/* Example:

    $config = new CloudflareConfig($env, {
      url: 'ACTIVITYPUB_URL',
      privateKey: 'ACTIVITYPUB_PRIVATE_KEY',
      database: 'ACTIVITYPUB_DB',
    })

(The database key may not stay here...)

*/

export class CloudflareConfig implements Configuration {
  public readonly url        : URL
  public readonly privateKey : string
  public readonly database   : D1Database
  public readonly username   : string = ''
  public readonly siteName   : string = ''

  constructor(env: Record<string, unknown>, mapping: Record<string, string>) {
    this.url = new URL(env[mapping.url] as string)
    this.privateKey = env[mapping.privateKey] as string
    this.database = env[mapping.database] as D1Database
  }

  getActorURL(_username: string): string {
    throw new NotImplementedError()
  }

  getActorBasedId(_username: string, _ending: string): string {
    throw new NotImplementedError()
  }

  localGet(url: string | URL): AP.CoreObject | undefined {
    console.info(url)
    throw new NotImplementedError()
  }
}
