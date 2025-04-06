/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import type * as AP from '@csjewell-activitypub/types'
import type { DatabaseRouter } from './database/router.ts'

/*
 */
export type Configuration<DatabaseT, TableT, SessionReturnT> = {
  url        : URL
  privateKey : string
  database   : DatabaseRouter<DatabaseT, TableT, SessionReturnT>
  debugDB?   : boolean
  siteName   : string

  localGet        : (url: string | URL) => AP.CoreObject | undefined
  getActorURL     : (username: string) => string
  getActorBasedId : (username: string, ending: string) => string
}
