/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { type Database, NotImplementedError, Utils } from '@csjewell-activitypub/general'
import { CloudflareD1Database } from './router.ts'
import type * as AP from '@csjewell-activitypub/types'
import type { CloudflareConfig } from './config.ts'
import type { DBCount } from './types.ts'

export class FollowCFStorage extends CloudflareD1Database implements Database.StorageHandler<AP.Follow> {
  private readonly message : AP.Follow

  constructor(env: CloudflareConfig, message: AP.Follow) {
    super(env)
    this.message = message
  }

  databaseId(): number | undefined {
    throw new NotImplementedError()
  }

  document(): AP.Follow {
    return this.message
  }

  async remove(): Promise<boolean> {
    // If from Mastodon - someone unfollowed me, we need to delete it from the store.
    const actorId = Utils.getEntityId(this.message.actor)
    const { username, usernameId, } = this.getUsername(this.message.object)

    if (usernameId === undefined) {
      return false
    }

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
    const guid = args[0] as string

    if (this.message.id === null) {
      return false
    }

    const id = (this.message.id as URL).toString()
    const actorId = Utils.getEntityId(this.message.actor as AP.EntityReference)!.toString()

    let isOK = false
    const stmtGet = this.handle.prepare('SELECT document_id FROM followers WHERE id = ? AND actor_id = ?').bind(
      id,
      actorId,
    )
    const resp = await stmtGet.run()

    if (resp.success && (resp.results[0] as DBCount).count > 0) {
      isOK = true
      console.info('Already Following')
    }

    if (isOK) {
      return true
    }

    console.info(`Adding follow message "${ id }" to ${ actorId }`)
    const stmtInsert = this.handle.prepare('INSERT INTO followers SET document_id = ?, actor_id = ?').bind(
      id,
      actorId,
      JSON.stringify(this.message),
    )
    const respInsert = await stmtInsert.run()

    if (respInsert.success && respInsert.meta.rows_written > 0) {
      isOK = true
    }

    const url = this.env.url.toString()
    const _user = this.env.username.toLowerCase()

    const _acceptRequest: AP.Accept = {
      '@context' : new URL('https://www.w3.org/ns/activitystreams'),
      'id'       : new URL(`${ url }#${ guid }`),
      'type'     : 'Accept',
      'actor'    : new URL(this.env.getActorURL('')),
      'object'   : this.message.id as URL,
    }

    return isOK
  }

  async exists(): Promise<boolean> {
    if (this.message.id === null) {
      return false
    }

    const id = (this.message.id as URL).toString()
    const actorId = '' // TODO: this.env.getActorId(this.message.actor as AP.EntityReference).toString()

    let isOK = false
    const stmtGet = this.handle.prepare('SELECT COUNT(*) AS count FROM followers WHERE Id = ? AND ActorId = ?').bind(
      id,
      actorId,
    )
    const resp = await stmtGet.run()

    if (resp.success && (resp.results[0] as DBCount).count > 0) {
      isOK = true
      console.log('Already Following')
    }

    return isOK
  }

  retrieve = async (): Promise<AP.Follow> => {
    throw new NotImplementedError()
  }
}
