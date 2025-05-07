/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import {
  type Database as APDatabase, NotImplementedError, Utils,
} from '@csjewell-activitypub/general'
import type { Database } from 'better-sqlite3'
import type * as AP from '@csjewell-activitypub/types'
import type { SQLiteDatabase } from './database.ts'

type ValidAnnounce = { isValid: false } | {
  isValid    : true,
  actorId    : string,
  announceId : string,
}

export class AnnounceSQLiteStorage
implements APDatabase.StorageHandler<AP.Announce> {
  private router       : SQLiteDatabase
  private handle       : Database
  private message      : AP.Announce
  private dbAnnounceId : number | undefined = undefined

  constructor(router: SQLiteDatabase, message: AP.Announce) {
    this.router = router
    this.handle = router.handle
    this.message = message
  }

  databaseId = (): number | undefined => {
    return this.dbAnnounceId
  }

  document = (): AP.Announce => {
    return this.message
  }

  /* eslint-disable-next-line @typescript-eslint/require-await -- Not implemented yet */
  count = async (): Promise<number> => {
    throw new NotImplementedError()
  }

  private validateMessage = (): ValidAnnounce => {
    const actorId = Utils.getEntityId(this.message.actor)

    if (actorId === undefined) {
      console.error('An Announce cannot be anonymous.')
      return { isValid: false, }
    }

    // Resolve the thing being announced.
    // (We need the object, where we could get a ref)
    const { object, } = this.router.getDocument(this.message.object)

    if (object === undefined) {
      console.error('What object are we trying to announce?')
      return { isValid: false, }
    }

    const announceId = object.id

    if (announceId === null || announceId === undefined) {
      console.error('The object we are trying to announce has no id.')
      return { isValid: false, }
    }

    // If it is not OUR content being announced, do not need to delete it, for it was never saved.
    /*
    if (announceId.hostname !== this.env.url.hostname) {
      console.error('The object we are trying to announce is not ours.')
      return { isValid: false, }
    }
    */

    this.message.object = object
    return { isValid: true, announceId: announceId.toString(), actorId, }
  }

  remove = (): boolean => {
    // If from Mastodon - someone un-announced the post. We need to delete it from the store.
    const messageInfo = this.validateMessage()

    if (!messageInfo.isValid) {
      return false
    }

    const { actorId, announceId, } = messageInfo

    console.info(`Attempting to delete Announce ${ actorId } on ${ announceId }`)

    let isOK = false
    const stmtDel = this.handle.prepare('DELETE FROM announces WHERE message_id = ? AND actor_id = ?')
    const resp = stmtDel.run(announceId, actorId)

    if (resp.changes > 0) {
      isOK = true
      console.info(`Deleted Announce ${ announceId } on ${ actorId }`, resp)
    }

    return isOK
  }

  save = (): boolean => {
    const messageInfo = this.validateMessage()

    if (!messageInfo.isValid) {
      return false
    }

    const { actorId, announceId, } = messageInfo

    console.info(`Attempting to store Announce ${ actorId } on ${ announceId }`)

    let isOK = false
    const stmtInsert = this.handle.prepare(`
      INSERT
        INTO announces (message_id, actor_id)
      VALUES           (         ?,        ?)
    `)
    const resp = stmtInsert.run(announceId, actorId)

    if (resp.changes > 0) {
      isOK = true
      console.info(`Stored Announce ${ announceId } on ${ actorId }`, resp)
    }

    return isOK
  }

  /* eslint-disable-next-line @typescript-eslint/require-await -- Not implemented yet */
  exists = async (): Promise<boolean> => {
    throw new NotImplementedError()
  }

  /* eslint-disable-next-line @typescript-eslint/require-await -- Not implemented yet */
  retrieve = async (): Promise<AP.Announce> => {
    throw new NotImplementedError()
  }

  shorten = (): { url: URL | undefined; id: number | undefined } => {
    throw new NotImplementedError()
  }
}
