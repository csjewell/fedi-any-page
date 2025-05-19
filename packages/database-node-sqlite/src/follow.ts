/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { type Database, NotImplementedError, Utils } from '@csjewell-activitypub/general'
import { SQLiteDatabase } from './database.ts'
import type { Keyv } from 'keyv'
import type { DatabaseSync } from 'node:sqlite'
import type * as AP from '@csjewell-activitypub/types'

type ValidFollow = { isValid: false } | {
  isValid    : true,
  actorId    : string,
  followedId : string,
  username   : string,
  usernameId : number,
}

// "actor" follows "object"
export class FollowSQLiteStorage
  extends SQLiteDatabase
  implements Database.StorageHandler<AP.Follow> {
  private readonly message : AP.Follow
  private url = new URL('https://test-sqlite.localhost/')

  constructor(cache: Keyv, handle: DatabaseSync, message: AP.Follow) {
    super(cache, handle)
    this.message = message
  }

  databaseId = (): number | undefined => {
    throw new NotImplementedError()
  }

  document = (): AP.Follow => {
    return this.message
  }

  private validateMessage = (): ValidFollow => {
    const actorId = Utils.getEntityId(this.message.actor)

    if (actorId === undefined) {
      console.error('A Follow cannot be anonymous.')
      return { isValid: false, }
    }

    // Resolve the thing being followed.
    // (We need the object, where we could get a ref)
    // TODO: [2025-04-19] We could optimize this, since we know this is OUR actor.
    const { object, } = this.getDocument(this.message.object)

    if (object === undefined) {
      console.error('What object are we trying to follow?')
      return { isValid: false, }
    }

    const followedId = object.id

    if (followedId === null || followedId === undefined) {
      console.error('The object we are trying to follow has no id.')
      return { isValid: false, }
    }

    // If it is not OUR content being announced, do not need to delete it, for it was never saved.
    if (followedId.hostname !== this.url.hostname) {
      console.error('The object we are trying to follow is not ours.')
      return { isValid: false, }
    }

    // TODO: [2025-04-19] Resolve the followedId to a username, and then to a usernameId
    return { isValid: true, followedId: followedId.toString(), username: '', usernameId: -1, actorId, }
  }


  remove = (): boolean => {
    // If from Mastodon - someone unfollowed me, we need to delete it from the store.
    const messageInfo = this.validateMessage()

    if (!messageInfo.isValid) {
      return false
    }

    const { actorId, username, usernameId, } = messageInfo

    console.info(`Attempting to delete ${ actorId } from followers of ${ username }`)

    let isOK = false
    const stmtDel = this.handle.prepare(`
      DELETE
        FROM followers
       WHERE username_id = ?
         AND actor_id    = ?
    `)
    const resp = stmtDel.run(usernameId, actorId)

    if (resp.changes > 0) {
      console.info(`Deleted Follow ${ actorId }`, resp)
      isOK = true
    }

    return isOK
  }

  save = async (...args: Array<unknown>): Promise<boolean> => {
    const messageInfo = this.validateMessage()

    if (!messageInfo.isValid) {
      return false
    }

    const { actorId, username, usernameId, } = messageInfo
    const guid = args[0] as string
    const documentId = this.message.id

    if (documentId === null || documentId === undefined) {
      return false
    }

    let isOK = false
    const stmtGet = this.handle.prepare(`
      SELECT COUNT(*) AS count
        FROM followers
       WHERE username_id = ?
         AND actor_id    = ?
    `)
    const resp = stmtGet.all(usernameId, actorId)

    if ((resp[0] as { count: number }).count > 0) {
      console.info('Already Following')
      return true
    }

    console.info(`Adding follow message "${ documentId.toString() }" (${ actorId } is following ${ username })`)
    const stmtInsert = this.handle.prepare(`
      INSERT
        INTO followers (document_id, actor_id, username_id)
      VALUES           (?,           ?,        ?)
    `)

    const respInsert = stmtInsert.run(
      documentId.toString(),
      actorId,
      usernameId,
    )

    if (respInsert.changes > 0) {
      isOK = true
    }

    const url = this.url.toString()

    const acceptRequest: AP.Accept = {
      '@context' : new URL('https://www.w3.org/ns/activitystreams'),
      'id'       : new URL(`${ url }#${ guid }`),
      'type'     : 'Accept',
      'actor'    : new URL(this.getActorURL(username)),
      'object'   : documentId,
    }

    isOK = isOK && await this.sendToOutbox(username, false, acceptRequest)
    return isOK
  }

  exists = (): boolean => {
    if (this.message.id === null) {
      return false
    }

    const documentId = (this.message.id as URL).toString()
    // TODO: this.env.getActorId(this.message.actor as AP.EntityReference).toString()
    const actorId = ''

    let isOK = false
    const stmtGet = this.handle.prepare(`
      SELECT COUNT(*) AS count
        FROM followers
       WHERE id = ?
         AND actor_id = ?
    `)
    const resp = stmtGet.all(documentId, actorId)

    if ((resp[0] as { count: number }).count > 0) {
      isOK = true
      console.info('Already Following')
    }

    return isOK
  }

  retrieve = (): AP.Follow => {
    throw new NotImplementedError()
  }

  shorten = (): { url: URL | undefined; id: number | undefined } => {
    throw new NotImplementedError()
  }

  /* Temporarily here while we work out what is needed. */
  getActorURL = (_username: string): string => {
    throw new NotImplementedError()
  }
}
