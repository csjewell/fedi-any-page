/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { type Database, NotImplementedError, Utils } from '@csjewell-activitypub/general'
import { CloudflareD1Database } from './router.ts'
import type { Keyv } from 'keyv'
import type * as AP from '@csjewell-activitypub/types'
import type { CloudflareConfig } from './config.ts'
import type { DBCount } from './types.ts'

type ValidFollow = { isValid: false } | {
  isValid    : true,
  actorId    : string,
  followedId : string,
  username   : string,
  usernameId : number,
}

// "actor" follows "object"
export class FollowCFStorage
  extends CloudflareD1Database
  implements Database.StorageHandler<AP.Follow> {
  private readonly message : AP.Follow

  constructor(cache: Keyv, env: CloudflareConfig, message: AP.Follow) {
    super(cache, env)
    this.message = message
  }

  databaseId(): number | undefined {
    throw new NotImplementedError()
  }

  document(): AP.Follow {
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
    if (followedId.hostname !== this.env.url.hostname) {
      console.error('The object we are trying to follow is not ours.')
      return { isValid: false, }
    }

    // TODO: [2025-04-19] Resolve the followedId to a username, and then to a usernameId
    return { isValid: true, followedId: followedId.toString(), username: '', usernameId: -1, actorId, }
  }


  async remove(): Promise<boolean> {
    // If from Mastodon - someone unfollowed me, we need to delete it from the store.
    const messageInfo = this.validateMessage()

    if (!messageInfo.isValid) {
      return false
    }

    const { actorId, username, usernameId, } = messageInfo

    console.info(`Attempting to delete ${ actorId } from followers of ${ username }`)

    let isOK = false
    const stmtDel = this.handle.prepare('DELETE FROM followers WHERE username_id = ? AND actor_id = ?').bind(
      usernameId,
      actorId,
    )
    const resp = await stmtDel.run()

    if (resp.meta.rows_written > 0) {
      console.info(`Deleted Follow ${ actorId }`, resp)
      isOK = true
    }

    return isOK
  }

  async save(...args: Array<unknown>): Promise<boolean> {
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
    const stmtGet = this.handle.prepare('SELECT document_id FROM followers WHERE username_id = ? AND actor_id = ?').bind(
      usernameId,
      actorId,
    )
    const resp = await stmtGet.run()

    if ((resp.results[0] as DBCount).count > 0) {
      console.info('Already Following')
      return true
    }

    console.info(`Adding follow message "${ documentId.toString() }" (${ actorId } is following ${ username })`)
    const stmtInsert = this.handle.prepare('INSERT INTO followers SET document_id = ?, actor_id = ?, username_id = ?').bind(
      documentId.toString(),
      actorId,
      usernameId,
    )
    const respInsert = await stmtInsert.run()

    if (respInsert.meta.rows_written > 0) {
      isOK = true
    }

    const url = this.env.url.toString()

    const acceptRequest: AP.Accept = {
      '@context' : new URL('https://www.w3.org/ns/activitystreams'),
      'id'       : new URL(`${ url }#${ guid }`),
      'type'     : 'Accept',
      'actor'    : new URL(this.env.getActorURL(username)),
      'object'   : documentId,
    }

    isOK = isOK && await this.env.database.sendToOutbox(usernameId, actorId, acceptRequest)
    return isOK
  }

  async exists(): Promise<boolean> {
    if (this.message.id === null) {
      return false
    }

    const documentId = (this.message.id as URL).toString()
    // TODO: this.env.getActorId(this.message.actor as AP.EntityReference).toString()
    const actorId = ''

    let isOK = false
    const stmtGet = this.handle.prepare('SELECT COUNT(*) AS count FROM followers WHERE Id = ? AND ActorId = ?').bind(
      documentId,
      actorId,
    )
    const resp = await stmtGet.run()

    if ((resp.results[0] as DBCount).count > 0) {
      isOK = true
      console.info('Already Following')
    }

    return isOK
  }

  /* eslint-disable-next-line @typescript-eslint/require-await -- Not implemented yet */
  retrieve = async (): Promise<AP.Follow> => {
    throw new NotImplementedError()
  }
}
