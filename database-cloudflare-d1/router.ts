/* SPDX-License-Identifier: MIT */
import * as Kit from '@csjewell-activitypub/general'
import type { AP } from 'activitypub-core-types'
import type D1Database from '@cloudflare/workers-types'
import { ActorCFStorage } from './actor.ts'
import { AnnounceCFStorage } from './announce.ts'
import { FollowCFStorage } from './follow.ts'
import { LikeCFStorage } from './like.ts'
import { NoteCFStorage } from './note.ts'
import type { DBDocumentInfo } from './types.ts'

export class CloudflareD1Database implements Kit.DatabaseRouter {
  protected handle: D1Database
  protected hostName: string
  protected env: Kit.Configuration
  protected debugDB = false

  constructor(env: Kit.Configuration) {
    this.hostName = env.url.hostname
    this.handle = env.database
    if ('debugDB' in env) {
      this.debugDB = env.debugDB ?? false
    }
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

  documentEntry(_message: AP.CoreObjectReference | AP.LinkReference): Kit.Database {
    throw new Kit.NotImplementedError()
  }

  getUsername(dr: string | AP.EntityReference | Array<AP.EntityReference> | null | undefined): Kit.DBUsername {
    if (Array.isArray(dr) || dr === undefined || dr === null) {
      return <Kit.DBUsername> { username: undefined, usernameId: undefined }
    }

    const er = Kit.entityRefToURL(dr)
    if (er === undefined || er === null) {
      return <Kit.DBUsername> { username: undefined, usernameId: undefined }
    }

    // TODO: Finish implementing.
    throw new Kit.NotImplementedError()
  }

  /** */
  getDocument(dr: string | AP.EntityReference | Array<AP.EntityReference> | null | undefined): Kit.DBDocument {
    if (Array.isArray(dr) || dr === undefined || dr === null) {
      return <Kit.DBDocument> { object: undefined, objectId: undefined }
    }

    const er = Kit.entityRefToURL(dr)
    if (er === undefined || er === null) {
      return <Kit.DBDocument> { object: undefined, objectId: undefined }
    }

    // TODO: Finish implementing.
    throw new Kit.NotImplementedError()
  }

  isDBDocumentInfo(info: unknown): info is DBDocumentInfo {
    return ((info !== undefined) && (info !== null) && (typeof info === 'object') && ('doc' in info))
  }

  assertIsDBDocumentInfo(info: DBDocumentInfo | undefined): asserts info is DBDocumentInfo {
    if (!this.isDBDocumentInfo(info)) {
      throw new TypeError(`${info} is not document information (DBDocumentInfo)`)
    }
  }
}
