/* SPDX-License-Identifier: MIT */
// import * as Json from '@csjewell-activitypub/json'
import * as Kit from '@csjewell-activitypub/general'
import type { AP } from 'activitypub-core-types'
import { CloudflareD1Database } from './router.ts'
import type { DBCount, DBId as _DBId } from './types.ts'

export class FollowCFStorage extends CloudflareD1Database implements Kit.Database {
  private readonly message: AP.Follow

  constructor(env: Kit.Configuration, message: AP.Follow) {
    super(env)
    this.message = message
  }

  remove(): boolean {
    // If from Mastodon - someone unfollowed me, we need to delete it from the store.
    const actorId = Kit.getEntityId(this.message.actor)
    const { username, usernameId } = Kit.getUsername(this.message.object) ?? { username: '', usernameId: -1 }
    if (usernameId === -1) {
      return false
    }

    console.log(`Attempting to delete ${actorId} from followers of ${username}`)

    let ok = false
    const stmtDel = this.handle.prepare('DELETE FROM followers WHERE username_id = ? AND actor_id = ?')
    void stmtDel.bind(usernameId, actorId).run().then((resp: D1Result) => {
      if (resp.success && resp.meta.rows_written > 0) {
        console.log(`Deleted Follow ${actorId}`, resp)
        ok = true
      }
    })

    return ok
  }

  save(_guid: string): boolean {
    if (this.message.id === null) {
      return false
    }

    const id = (this.message.id as URL).toString()
    const actorId = Kit.getEntityId(this.message.actor as AP.EntityReference)!.toString()

    let ok = false
    const stmtGet = this.handle.prepare('SELECT document_id FROM followers WHERE Id = ? AND ActorId = ?')
    void stmtGet.bind(id, actorId).run().then((resp: D1Result) => {
      if (resp.success && (resp.results[0] as DBCount).count > 0) {
        ok = true
        console.log('Already Following')
      }
    })

    if (ok) {
      return true
    }

    console.log(`Adding follow message "${id}" to ${actorId}`)
    const stmtInsert = this.handle.prepare('INSERT INTO followers SET document_id = ?, actor_id = ?')
    void stmtInsert.bind(id, actorId, JSON.stringify(this.message)).run().then((resp: D1Result) => {
      if (resp.success && resp.meta.rows_written > 0) {
        ok = true
      }
    })

    const _url = this.env.url.toString()
    const _user = this.env.username.toLowerCase()

    const _acceptRequest: AP.Accept = {
      '@context': 'https://www.w3.org/ns/activitystreams',
      //      id: `${url}#${guid}`,
      type: 'Accept',
      actor: new URL(this.env.getActorURL('')),
      object: this.message.id as URL,
    }

    return ok
  }

  exists(): boolean {
    if (this.message.id === null) {
      return false
    }

    const id = (this.message.id as URL).toString()
    const actorId = '' // TODO: this.env.getActorId(this.message.actor as AP.EntityReference).toString()

    let ok = false
    const stmtGet = this.handle.prepare('SELECT COUNT(*) AS count FROM followers WHERE Id = ? AND ActorId = ?')
    void stmtGet.bind(id, actorId).run().then((resp: D1Result) => {
      if (resp.success && (resp.results[0] as DBCount).count > 0) {
        ok = true
        console.log('Already Following')
      }
    })

    return ok
  }

  retrieve(): undefined {
    throw new Kit.NotImplementedError()
  }
}
