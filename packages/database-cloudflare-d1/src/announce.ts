/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { type Database, NotImplementedError, Utils } from '@csjewell-activitypub/general'
import { CloudflareD1Database } from './router.ts'
import type * as AP from '@csjewell-activitypub/types'
import type { CloudflareConfig } from './config.ts'

type ValidAnnounce = { isValid: false } | {
  isValid    : true,
  actorId    : string,
  announceId : string,
}

export class AnnounceCFStorage extends CloudflareD1Database implements Database.StorageHandler<AP.Announce> {
  private message      : AP.Announce
  private dbAnnounceId : number | undefined = undefined

  constructor(env: CloudflareConfig, message: AP.Announce) {
    super(env)
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
    const { object, } = this.getDocument(this.message.object)

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
    if (announceId.hostname !== this.env.url.hostname) {
      console.error('The object we are trying to announce is not ours.')
      return { isValid: false, }
    }

    this.message.object = object
    return { isValid: true, actorId, announceId: announceId.toString(), }
  }

  remove = async (): Promise<boolean> => {
    // If from Mastodon - someone un-announced the post. We need to delete it from the store.
    const messageInfo = this.validateMessage()

    if (!messageInfo.isValid) {
      return false
    }

    const { actorId, announceId, } = messageInfo

    console.info(`Attempting to delete Announce ${ actorId } on ${ announceId }`)

    let isOK = false
    const stmtDel = this.handle.prepare('DELETE FROM announces WHERE message_id = ? AND actor_id = ?').bind(
      announceId,
      actorId,
    )
    const resp = await stmtDel.run()

    if (resp.meta.rows_written > 0) {
      isOK = true
      console.info(`Deleted Announce ${ announceId } on ${ actorId }`, resp)
    }

    return isOK
  }

  save = async (): Promise<boolean> => {
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
    `).bind(announceId, actorId)
    const resp = await stmtInsert.run()

    if (resp.meta.rows_written > 0) {
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
}
