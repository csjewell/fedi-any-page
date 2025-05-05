/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { type Configuration, NotImplementedError } from '@csjewell-activitypub/general'
import { LocalDB } from './database.ts'
import type Keyv from 'keyv'
import type { DatabaseSync } from 'node:sqlite'
import type * as AP from '@csjewell-activitypub/types'

export class TestConfig implements Configuration<DatabaseSync> {
  public readonly url        : URL = new URL('http://test-hapi.localhost/')
  public readonly privateKey : string = 'locked'
  public readonly debugDB    : boolean = false
  public readonly siteName   : string = 'Test Site'
  public readonly database   : LocalDB

  constructor(cache: Keyv) {
    this.database = new LocalDB(cache)
  }

  localGet(_url: string | URL): AP.CoreObject | undefined {
    throw new NotImplementedError()
  }

  getActorURL(_username: string): string {
    throw new NotImplementedError()
  }

  getActorBasedId(_username: string, _ending: string): string {
    throw new NotImplementedError()
  }
}
