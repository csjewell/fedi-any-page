/* SPDX-License-Identifier: MIT */
import type * as AP from '@csjewell-activitypub/types'

/*
 */
export default interface Configuration {
  url: URL
  privateKey: string
  database: unknown
  username: string
  debugDB?: boolean
  siteName: string

  localGet(url: string | URL): AP.CoreObject | undefined
  getActorURL(username: string): string
  getActorBasedId(username: string, ending: string): string
}
