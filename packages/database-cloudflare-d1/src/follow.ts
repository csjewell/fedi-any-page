/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import * as Kit from '@csjewell-activitypub/general'
import { NotImplementedError } from '@csjewell-activitypub/general/errors'
import { CloudflareD1Database } from './router.ts'
import type { default as Configuration } from '@csjewell-activitypub/general/configuration'
import type { Database } from '@csjewell-activitypub/general/database/handler'
import type * as AP from '@csjewell-activitypub/types'
import type { DBCount, DBId as _DBId } from './types.ts'

export class FollowCFStorage extends CloudflareD1Database implements Database {
  private readonly message : AP.Follow

  constructor(env: Configuration, message: AP.Follow) {
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
    const actorId = Kit.getEntityId(this.message.actor)
    const { username, usernameId, } = this.getUsername(this.message.object)

    if (usernameId === undefined) {
      return false
    }

    console.log(`Attempting to delete ${ actorId } from followers of ${ username }`)

    let ok = false
    const stmtDel = this.handle.prepare('DELETE FROM followers WHERE username_id = ? AND actor_id = ?').bind(
      usernameId,
      actorId,
    )
    const resp = await stmtDel.run()

    if (resp.success && resp.meta.rows_written > 0) {
      console.log(`Deleted Follow ${ actorId }`, resp)
      ok = true
    }

    return ok
  }

  async save(guid: string): Promise<boolean> {
    if (this.message.id === null) {
      return false
    }

    const id = (this.message.id as URL).toString()
    const actorId = Kit.getEntityId(this.message.actor as AP.EntityReference)!.toString()

    let ok = false
    const stmtGet = this.handle.prepare('SELECT document_id FROM followers WHERE id = ? AND actor_id = ?').bind(
      id,
      actorId,
    )
    const resp = await stmtGet.run()

    if (resp.success && (resp.results[0] as DBCount).count > 0) {
      ok = true
      console.log('Already Following')
    }

    if (ok) {
      return true
    }

    console.log(`Adding follow message "${ id }" to ${ actorId }`)
    const stmtInsert = this.handle.prepare('INSERT INTO followers SET document_id = ?, actor_id = ?').bind(
      id,
      actorId,
      JSON.stringify(this.message),
    )
    const respInsert = await stmtInsert.run()

    if (respInsert.success && respInsert.meta.rows_written > 0) {
      ok = true
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

    return ok
  }

  async exists(): Promise<boolean> {
    if (this.message.id === null) {
      return false
    }

    const id = (this.message.id as URL).toString()
    const actorId = '' // TODO: this.env.getActorId(this.message.actor as AP.EntityReference).toString()

    let ok = false
    const stmtGet = this.handle.prepare('SELECT COUNT(*) AS count FROM followers WHERE Id = ? AND ActorId = ?').bind(
      id,
      actorId,
    )
    const resp = await stmtGet.run()

    if (resp.success && (resp.results[0] as DBCount).count > 0) {
      ok = true
      console.log('Already Following')
    }

    return ok
  }

  // deno-lint-ignore require-await
  async retrieve(): Promise<undefined> {
    throw new NotImplementedError()
  }
}
