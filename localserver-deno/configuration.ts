/* SPDX */
import { NotImplementedError } from '@csjewell-activitypub/general/errors'
import type { default as Configuration } from '@csjewell-activitypub/general/configuration'
import * as AP from '@csjewell-activitypub/types'
// import * from 'node:crypto'
import { db } from './database.ts'

class TestConfig implements Configuration {
  public readonly url: URL = new URL('http://test-deno.localhost/')
  public readonly privateKey: string = 'locked'
  public readonly database = db
  public readonly username: string = 'testuser1'
  public readonly debugDB: boolean = false
  public readonly siteName: string = 'Test Site'

  localGet(url: string | URL): AP.CoreObject | undefined {
    throw new NotImplementedError()
  }

  getActorURL(username: string): string {
    throw new NotImplementedError()
  }

  getActorBasedId(username: string, ending: string): string {
    throw new NotImplementedError()
  }
}

export const config = new TestConfig()
