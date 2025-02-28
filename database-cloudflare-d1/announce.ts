/* SPDX-License-Identifier: MIT */
import * as Kit from '@csjewell-activitypub/general'
import type { AP } from 'activitypub-core-types'
import { CloudflareD1Database } from './router.ts'

// import * as Json from '@csjewell-activitypub/json'
// import type { DBCount, DBId } from './types.ts'

export class AnnounceCFStorage extends CloudflareD1Database implements Kit.Database {
  private message: AP.Announce

  constructor(env: Kit.Configuration, message: AP.Announce) {
    super(env)
    this.message = message
  }

  databaseId(): number | undefined {
    throw new Kit.NotImplementedError()
  }

  count(): number {
    throw new Kit.NotImplementedError()
  }

  remove(): boolean {
    // If from Mastodon - someone un-announced the post. We need to delete it from the store.
    const actorId = Kit.getEntityId(this.message.actor)

    const { object } = this.getDocument(this.message.object)
    if (object === undefined) {
      return false
    }

    const announceId = object.id
    if (announceId === null || announceId === undefined) {
      return true
    }

    // If it is not OUR content being announced, do not need to delete it, for it was never saved.
    if (Kit.entityRefToURL(announceId)!.hostname !== this.env.url.hostname) {
      return true
    }

    console.log(`Attempting to delete Announce ${actorId} on ${announceId.toString()}`)

    let ok = false
    const stmtDel = this.handle.prepare('DELETE FROM announces WHERE message_id = ? AND actor_id = ?')
    void stmtDel.bind(announceId.toString(), actorId).run().then((resp: D1Result) => {
      if (resp.success && resp.meta.rows_written > 0) {
        ok = true
        console.log(`Deleted Announce ${announceId.toString()} on ${actorId}`, resp)
      }
    })

    return ok
  }

  save(): boolean {
    throw new Kit.NotImplementedError()
  }

  exists(): boolean {
    throw new Kit.NotImplementedError()
  }

  retrieve(): boolean {
    throw new Kit.NotImplementedError()
  }

  shorten(): { url: URL | undefined; id: number | undefined } {
    throw new Kit.NotImplementedError()
  }
}
