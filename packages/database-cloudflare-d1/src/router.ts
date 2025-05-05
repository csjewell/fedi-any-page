/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { Database, NotImplementedError, Utils } from '@csjewell-activitypub/general'
import { ActorCFStorage } from './actor.ts'
import { AnnounceCFStorage } from './announce.ts'
import { FollowCFStorage } from './follow.ts'
import { LikeCFStorage } from './like.ts'
import { NoteCFStorage } from './note.ts'
import type { Keyv } from 'keyv'
import type { D1Database } from '@cloudflare/workers-types'
import type * as AP from '@csjewell-activitypub/types'
import type { CloudflareConfig } from './config.ts'
import type { DBDocumentInfo } from './types.ts'

export class CloudflareD1Database extends Database.SessionRouter implements Database.Router<D1Database> {
  protected handle   : D1Database
  protected hostName : string
  protected env      : CloudflareConfig
  protected debugDB  : boolean

  constructor(cache: Keyv, env: CloudflareConfig, handle?: D1Database) {
    super(cache)
    this.hostName = env.url.hostname
    this.handle = handle ?? env.database.dbHandle()
    this.debugDB = false
    this.env = env
  }

  /** Returns the handle to the database itself. */
  dbHandle = (): D1Database => {
    return this.handle
  }

  /** */
  announce(message: AP.Announce): AnnounceCFStorage {
    return new AnnounceCFStorage(this.cache, this.env, message)
  }

  /** */
  follow(message: AP.Follow): FollowCFStorage {
    return new FollowCFStorage(this.cache, this.env, message)
  }

  /** */
  like(message: AP.Like): LikeCFStorage {
    return new LikeCFStorage(this.cache, this.env, message)
  }

  /** */
  note(message: AP.Note): NoteCFStorage {
    return new NoteCFStorage(this.cache, this.env, message)
  }

  /** */
  actor(message: AP.ActorReference): ActorCFStorage {
    return new ActorCFStorage(this.cache, this.env, message)
  }

  /** */
  documentEntry = (_message: AP.CoreObjectReference | AP.LinkReference): Database.StorageHandler<AP.CoreObject> => {
    throw new NotImplementedError()
  }

  getUsername = (dr: string | AP.EntityReference | Array<AP.EntityReference> | null | undefined): Database.DBUsername => {
    if (Array.isArray(dr) || dr === undefined || dr === null) {
      return { username: undefined, usernameId: undefined, } as Database.DBUsername
    }

    const er = Utils.entityRefToURL(dr)

    if (er === undefined) {
      return { username: undefined, usernameId: undefined, } as Database.DBUsername
    }

    // TODO: Finish implementing.
    throw new NotImplementedError()
  }

  /** */
  getDocument = (dr: string | AP.EntityReference | Array<AP.EntityReference> | null | undefined): Database.DBDocument => {
    if (Array.isArray(dr) || dr === undefined || dr === null) {
      return { object: undefined, objectId: undefined, } as Database.DBDocument
    }

    const er = Utils.entityRefToURL(dr)

    if (er === undefined) {
      return { object: undefined, objectId: undefined, } as Database.DBDocument
    }

    // TODO: Finish implementing.
    throw new NotImplementedError()
  }

  isDBDocumentInfo = (info: unknown): info is DBDocumentInfo => {
    return info !== undefined && info !== null && typeof info === 'object' && 'doc' in info
  }

  assertIsDBDocumentInfo = (info: DBDocumentInfo | undefined): asserts info is DBDocumentInfo => {
    if (!this.isDBDocumentInfo(info)) {
      throw new TypeError('Value passed in is not document information (DBDocumentInfo)')
    }
  }

  shorten = async (): Promise<{ url: URL | undefined; id: number | undefined }> => {
    if (!('exists' in this)) {
      throw new TypeError('Called shorten on the router')
    }

    const db = this as unknown as Database.StorageHandler<unknown>

    if (await db.exists()) {
      const doc = db.document() as AP.CoreObjectReference

      if (doc instanceof URL) {
        return { url: doc, id: db.databaseId(), }
      }

      const {id,} = doc

      if (id !== null && id !== undefined) {
        return { url: id, id: db.databaseId(), }
      }
    }

    return { url: undefined, id: undefined, }
  }

  users = (): Database.UsersStorage => {
    throw new NotImplementedError()
  }

  sendToOutbox = (_usernameId: number, _actor: string, _message: AP.CoreObject): AP.OrPromise<boolean> => {
    throw new NotImplementedError()
  }
}
