/* SPDX-License-Identifier: MIT */
// import * as Json from '@csjewell-activitypub/json'
import * as Kit from '@csjewell-activitypub/general'
import type { AP } from 'activitypub-core-types'
import { CloudflareD1Database } from './router.ts'
import type { DBCount, DBId } from './types.ts'

type LikeInfo = {
  actorId: string
  created: unknown
}

export class LikeCFStorage extends CloudflareD1Database implements Kit.Database {
  private readonly message: AP.Like
  private dbLikeId: number | undefined = undefined

  constructor(env: Kit.Configuration, message: AP.Like) {
    super(env)
    this.message = message
  }

  count(er: AP.EntityReference): number {
    if (er.hostname !== this.env.url.hostname) {
      // If we aren't ourselves, we were never here.
      return 0
    }

    let count = 0
    const stmtLikes = this.handle.prepare(
      'SELECT COUNT(*) AS count FROM likes WHERE liked_id = ? AND deletable = 0',
    )
    void stmtLikes.bind(er.toString()).run().then((resp: D1Result) => {
      if (resp.success) {
        count = (resp.results[0] as DBCount).count
      }
    })

    return count
  }

  likes(er: AP.EntityReference, getPrivate = false): unknown {
    if (er.hostname !== this.env.url.hostname) {
      // If we aren't ourselves, we were never here.
      return []
    }

    const likes: Array<LikeInfo> = []
    const sqlPrivate = getPrivate ? '' : 'AND private = 0'

    const stmtLikes = this.handle.prepare(
      `SELECT actor_id, created FROM likes WHERE liked_id = ? ${sqlPrivate} AND deletable = 0`,
    )
    void stmtLikes.bind(er.toString()).run().then((resp: D1Result) => {
      if (resp.success && (resp.results.length > 0)) {
        resp.results.forEach((info) => likes.push(<LikeInfo> { ...info }))
      }
    })

    return likes
  }

  remove(): boolean {
    // If from Mastodon - someone un-liked the post. We need to delete it from the store.
    const actorId = Kit.getEntityId(this.message.actor)

    const { object } = this.getDocument(this.message.object)
    if (object === undefined) {
      return false
    }

    let likedId = object.id
    if (likedId === null || likedId === undefined) {
      return false
    }

    likedId = Kit.toEntityRef(likedId)
    if (likedId === undefined || likedId === null) {
      return false
    }

    console.log(`Attempting to delete Like ${actorId} on ${likedId.toString()}`)
    if (likedId.hostname !== this.env.url.hostname) {
      // If we aren't ourselves, we were never here.
      return true
    }

    let ok = false
    const stmtDel = this.handle.prepare('DELETE FROM likes WHERE liked_id = ? AND actor_id = ?')
    void stmtDel.bind(likedId, actorId).run().then((resp: D1Result) => {
      if (resp.success) {
        ok = true
        console.log(`Deleted Like of ${actorId} on ${likedId.toString()}`, resp)
      }
    })

    return ok
  }

  save(): boolean {
    throw new Kit.NotImplementedError()

    /*
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    liked_id TEXT NOT NULL,
    actor_id TEXT NOT NULL REFERENCES actors (actor_id),
    document_id TEXT NOT NULL REFERENCES documents(document_id), -- Store the actual document in documents to be archived.
    private INT NOT NULL CHECK (private > -1) CHECK (private < 2) DEFAULT 0,
    deletable INT NOT NULL CHECK (deletable > -1) CHECK (deletable < 2) DEFAULT 0,
    created INT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified INT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    */
  }

  exists(): boolean {
    const actorId = Kit.getEntityId(this.message.actor)

    const { object } = this.getDocument(this.message.object)
    if (object === undefined) {
      return false
    }

    let likedId = object.id
    if (likedId === null || likedId === undefined) {
      return false
    }

    likedId = Kit.toEntityRef(likedId)
    if (likedId === undefined || likedId === null) {
      return false
    }

    if (likedId.hostname !== this.env.url.hostname) {
      // If we aren't ourselves, we were never here.
      return false
    }

    let ok = false
    const stmtExists = this.handle.prepare('SELECT id FROM likes WHERE liked_id = ? AND actor_id = ?')
    void stmtExists.bind(likedId, actorId).run().then((resp: D1Result) => {
      if (resp.success && (resp.results.length === 1)) {
        ok = true
        this.dbLikeId = (resp.results[0] as DBId).id
      }
    })

    return ok
  }

  retrieve(): undefined {
    throw new Kit.NotImplementedError()
  }
}
