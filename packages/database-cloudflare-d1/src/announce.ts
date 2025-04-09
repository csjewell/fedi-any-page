/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import * as Kit from '@csjewell-activitypub/general'
import { NotImplementedError, type Configuration, type Database } from '@csjewell-activitypub/general'
import { CloudflareD1Database } from './router.ts'
import type * as AP from '@csjewell-activitypub/types'

// import type { DBCount, DBId } from './types.ts'

export class AnnounceCFStorage extends CloudflareD1Database implements Database.StorageHandler<AP.Announce> {
  private message      : AP.Announce
  private dbAnnounceId : number | undefined = undefined

  constructor(env: Configuration<D1Database, unknown>, message: AP.Announce) {
    super(env)
    this.message = message
  }

  databaseId = (): number | undefined => {
    return this.dbAnnounceId
  }

  document = (): AP.Announce => {
    return this.message
  }

  count = async (): Promise<number> => {
    throw new NotImplementedError()
  }

  remove = async (): Promise<boolean> => {
    // If from Mastodon - someone un-announced the post. We need to delete it from the store.
    const actorId = Kit.getEntityId(this.message.actor)

    const { object, } = this.getDocument(this.message.object)

    if (object === undefined) {
      return false
    }

    const announceId = object.id

    if (announceId === null || announceId === undefined) {
      return true
    }

    // If it is not OUR content being announced, do not need to delete it, for it was never saved.
    const announceURL = Kit.entityRefToURL(announceId)

    if (announceURL === null || announceURL === undefined) {
      return true
    }

    if (announceURL.hostname !== this.env.url.hostname) {
      return true
    }

    console.log(`Attempting to delete Announce ${ actorId } on ${ announceURL.toString() }`)

    let ok = false
    const stmtDel = this.handle.prepare('DELETE FROM announces WHERE message_id = ? AND actor_id = ?').bind(
      announceURL.toString(),
      actorId,
    )
    const resp = await stmtDel.run()

    if (resp.success && resp.meta.rows_written > 0) {
      ok = true
      console.log(`Deleted Announce ${ announceURL.toString() } on ${ actorId }`, resp)
    }

    return ok
  }

  save = async (): Promise<boolean> => {
    const actorId = Kit.getEntityId(this.message.actor)

    const { object, } = this.getDocument(this.message.object)

    if (object === undefined) {
      return false
    }

    const announceId = object.id

    if (announceId === null || announceId === undefined) {
      return true
    }

    // If it is not OUR content being announced, do not need to insert it.
    if (Kit.entityRefToURL(announceId)!.hostname !== this.env.url.hostname) {
      return true
    }

    console.info(`Attempting to store Announce ${ actorId } on ${ announceId.toString() }`)

    let ok = false
    const stmtInsert = this.handle.prepare(`
      INSERT
        INTO announces (message_id, actor_id)
      VALUES           (         ?,        ?)
    `).bind(announceId.toString(), actorId)
    const resp = await stmtInsert.run()

    if (resp.success && resp.meta.rows_written > 0) {
      ok = true
      console.log(`Stored Announce ${ announceId.toString() } on ${ actorId }`, resp)
    }

    return ok
  }

  exists = async (): Promise<boolean> => {
    throw new NotImplementedError()
  }

  retrieve = async (): Promise<AP.Announce> => {
    throw new NotImplementedError()
  }
}
