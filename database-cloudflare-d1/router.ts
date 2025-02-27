/* SPDX-License-Identifier: MIT */
import * as Kit from '@csjewell-activitypub/general'
import type { AP } from 'activitypub-core-types'
import type D1Database from '@cloudflare/workers-types'
import { ActorCFStorage } from './actor.ts'
import { AnnounceCFStorage } from './announce.ts'
import { FollowCFStorage } from './follow.ts'
import { LikeCFStorage } from './like.ts'
import { NoteCFStorage } from './note.ts'

export class CloudflareD1Database implements Kit.DatabaseRouter {
  protected handle: D1Database
  protected hostName: string
  protected env: Kit.Configuration

  constructor(env: Kit.Configuration) {
    this.hostName = env.url.hostname
    this.handle = env.database
    this.env = env
  }

  /** */
  get dbHandle(): D1Database {
    return this.handle
  }

  /** */
  announce(message: AP.Announce): AnnounceCFStorage {
    return new AnnounceCFStorage(this.env, message)
  }

  /** */
  follow(message: AP.Follow): FollowCFStorage {
    return new FollowCFStorage(this.env, message)
  }

  /** */
  like(message: AP.Like): LikeCFStorage {
    return new LikeCFStorage(this.env, message)
  }

  /** */
  note(message: AP.Note): NoteCFStorage {
    return new NoteCFStorage(this.env, message)
  }

  /** */
  actor(message: AP.ActorReference): ActorCFStorage {
    return new ActorCFStorage(this.env, message)
  }

  /** */
  getDocument(dr: string | AP.EntityReference | Array<AP.EntityReference>): Kit.DBDocument | undefined {
    if (Array.isArray(dr) || dr === undefined || dr === null) {
      return undefined
    }

    const er = Kit.entityRefToURL(dr)
    if (er === undefined || er === null) {
      return undefined
    }

    // TODO: Finish implementing.
    throw new Kit.NotImplementedError()
  }
}
