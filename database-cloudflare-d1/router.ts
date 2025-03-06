/* SPDX-License-Identifier: MIT */
import * as Kit from '@csjewell-activitypub/general'
import { NotImplementedError } from '@csjewell-activitypub/general/errors'
import type { default as Configuration } from '@csjewell-activitypub/general/configuration'
import type { Database } from '@csjewell-activitypub/general/database/handler'
import type { DatabaseRouter, DBDocument } from '@csjewell-activitypub/general/database/router'
import type { DBUsername } from '@csjewell-activitypub/general/database/misc'
import type * as AP from '@csjewell-activitypub/types'
import type D1Database from '@cloudflare/workers-types'
import { ActorCFStorage } from './actor.ts'
import { AnnounceCFStorage } from './announce.ts'
import { FollowCFStorage } from './follow.ts'
import { LikeCFStorage } from './like.ts'
import { NoteCFStorage } from './note.ts'
import type { DBDocumentInfo } from './types.ts'

export class CloudflareD1Database implements DatabaseRouter {
  protected handle: D1Database
  protected hostName: string
  protected env: Configuration
  protected debugDB = false

  constructor(env: Configuration) {
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

  /** */
  documentEntry(_message: AP.CoreObjectReference | AP.LinkReference): Database {
    throw new NotImplementedError()
  }

  getUsername(dr: string | AP.EntityReference | Array<AP.EntityReference> | null | undefined): DBUsername {
    if (Array.isArray(dr) || dr === undefined || dr === null) {
      return <DBUsername> { username: undefined, usernameId: undefined }
    }

    const er = Kit.entityRefToURL(dr)
    if (er === undefined || er === null) {
      return <DBUsername> { username: undefined, usernameId: undefined }
    }

    // TODO: Finish implementing.
    throw new NotImplementedError()
  }

  /** */
  getDocument(dr: string | AP.EntityReference | Array<AP.EntityReference> | null | undefined): DBDocument {
    if (Array.isArray(dr) || dr === undefined || dr === null) {
      return <DBDocument> { object: undefined, objectId: undefined }
    }

    const er = Kit.entityRefToURL(dr)
    if (er === undefined || er === null) {
      return <DBDocument> { object: undefined, objectId: undefined }
    }

    // TODO: Finish implementing.
    throw new NotImplementedError()
  }

  isDBDocumentInfo(info: unknown): info is DBDocumentInfo {
    return ((info !== undefined) && (info !== null) && (typeof info === 'object') && ('doc' in info))
  }

  assertIsDBDocumentInfo(info: DBDocumentInfo | undefined): asserts info is DBDocumentInfo {
    if (!this.isDBDocumentInfo(info)) {
      throw new TypeError(`${info} is not document information (DBDocumentInfo)`)
    }
  }

  async shorten(): Promise<{ url: URL | undefined; id: number | undefined }> {
    if (!('exists' in this)) {
      throw new TypeError('Called shorten on the router')
    }

    const db = this as unknown as Database

    if (await db.exists()) {
      const doc = db.document() as AP.CoreObjectReference
      if (doc instanceof URL) {
        return { url: doc, id: db.databaseId() }
      }

      const id = doc.id
      if ((id !== null) && (id !== undefined)) {
        return { url: id, id: db.databaseId() }
      }
    }

    return { url: undefined, id: undefined }
  }
}
