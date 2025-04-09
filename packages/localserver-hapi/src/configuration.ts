/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { type Configuration, NotImplementedError, type Server } from '@csjewell-activitypub/general'
import Db from './database.ts'
import type { DatabaseSync } from 'node:sqlite'
import type * as AP from '@csjewell-activitypub/types'

type AuthCookies = Server.RePliers.AuthInfo

export class TestConfig implements Configuration<DatabaseSync, AuthCookies> {
  public readonly url        : URL = new URL('http://test-deno.localhost/')
  public readonly privateKey : string = 'locked'
  public readonly database = Db
  public readonly debugDB    : boolean = false
  public readonly siteName   : string = 'Test Site'

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

export const Config = new TestConfig()
