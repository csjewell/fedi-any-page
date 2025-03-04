/* SPDX */
import { type Configuration, NotImplementedError } from '@csjewell-activitypub/general'
import * as AP from '@csjewell-activitypub/types'

class TestConfig implements Configuration {
  public readonly url: URL = new URL('https://test-deno.example/')
  public readonly privateKey: string = 'locked'
  public readonly database: unknown = {}
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
