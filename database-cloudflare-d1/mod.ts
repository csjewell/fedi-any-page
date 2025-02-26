/* SPDX-License-Identifier: MIT */
import { isTypeOf } from 'activitypub-core-types/lib/assertions/index.js'
import { ActorTypes } from 'activitypub-core-types/lib/activitypub/util/const.js'
import * as Json from '@csjewell-activitypub/json'
import * as Kit from '@csjewell-activitypub/general'
import type { AP } from 'activitypub-core-types'
import type { CoreObject, EntityReference } from 'activitypub-core-types/lib/activitypub/index.js'
import type { D1Database } from '@cloudflare/workers-types'

type DBCount = {
  count: number
}

export default class CloudflareD1Database implements Kit.DatabaseRouter {
  protected handle: D1Database
  protected hostName: string
  protected env: Kit.Configuration

  constructor(env: Kit.Configuration) {
    this.hostName = env.url().hostname
    this.handle = env.database()
    this.env = env
  }

  get dbHandle(): D1Database {
    return this.handle
  }

  announce(message: AP.Announce): AnnounceCFStorage {
    return new AnnounceCFStorage(this.env, message)
  }

  follow(message: AP.Follow): FollowCFStorage {
    return new FollowCFStorage(this.env, message)
  }

  like(message: AP.Like): LikeCFStorage {
    return new LikeCFStorage(this.env, message)
  }

  note(message: AP.Note): NoteCFStorage {
    return new NoteCFStorage(this.env, message)
  }

  actor(message: AP.ActorReference): ActorCFStorage {
    return new ActorCFStorage(this.env, message)
  }

  getDocument(_dr: string | EntityReference | Array<EntityReference> | URL | undefined): CoreObject | undefined {
    throw new Kit.NotImplementedError()
  }
}

class ActorCFStorage extends CloudflareD1Database implements Kit.Database {
  protected message: AP.ActorReference
  protected dbActorId: number | undefined

  constructor(env: Kit.Configuration, message: AP.ActorReference) {
    super(env)
    this.message = message
    this.dbActorId = undefined
  }

  remove(): boolean {
    throw new Kit.NotImplementedError()
  }

  save(): boolean {
    throw new Kit.NotImplementedError()
  }

  exists(): boolean {
    let checkId: string | undefined
    if (this.dbActorId !== undefined) {
      return true
    }

    if (this.message instanceof URL) {
      checkId = this.message.toString()
    }

    if (isTypeOf(this.message as AP.Actor, ActorTypes)) {
      const id = (this.message as AP.Actor).id
      if (id === null) {
        return false
      }

      checkId = Kit.entityRefToString(id)
    }

    if (checkId === undefined || checkId === null) {
      return false
    }

    let ok = false
    const stmtActor = this.handle.prepare('SELECT COUNT(*) AS count FROM actors WHERE actor_id = ?')
    void stmtActor.bind(checkId).run().then((resp: D1Result) => {
      if (resp.success && (resp.results[0] as DBCount).count === 1) {
        ok = true
      }
    })

    return ok
  }

  retrieve(): AP.Actor | undefined {
    if (this.dbActorId !== undefined) {
      return this.message as AP.Actor
    }

    const er = isTypeOf(this.message as AP.Actor, ActorTypes) ? (this.message as AP.Actor).id : this.message
    if (er === undefined || er === null) {
      return undefined
    }

    const actorURL = Kit.entityRefToURL(er)

    if (actorURL === undefined) {
      return undefined
    }

    actorURL.hash = ''

    console.log(`Retrieving actor message "${actorURL.toString()}"`)
    let actorInfoJSON: string | undefined
    void fetch(actorURL, {
      headers: {
        accept: 'application/activity+json, application/ld+json, application/json',
      },
      method: 'GET',
      redirect: 'follow',
    }).then((resp: Response) => {
      void resp.text().then((s: string) => {
        actorInfoJSON = s
      })
    })

    if (actorInfoJSON === undefined) {
      return undefined
    }

    const actorInfo: AP.Actor = <AP.Actor> Json.parse(actorInfoJSON)

    if (actorInfo.id === null || actorInfo.id === undefined) {
      return undefined
    }

    if (actorInfo.id.toString() !== actorURL.toString()) {
      console.log(
        `Tried to retrieve actor at ${actorURL.toString()} and got an actor at ${actorInfo.id.toString()} instead`,
      )
      return undefined
    }

    console.log(`Storing actor message "${actorURL.toString()}"`)
    let documentId: number | undefined
    const stmtDocument = this.handle.prepare('INSERT INTO documents SET document_id = ?, type = ?, document = ?')

    void stmtDocument.bind(actorInfo.id, actorInfo.type, actorInfoJSON).run().then((resp: D1Result) => {
      if (resp.success) {
        documentId = resp.meta.last_row_id
      }
    })

    if (documentId === undefined) {
      return undefined
    }

    const preferredUsername = actorInfo.preferredUsername
    const stmtActor = this.handle.prepare(
      'INSERT INTO actors SET actor_id = ?, document_id = ?, inbox = ?, outbox = ?, preferred_username = ?',
    )
    void stmtActor.bind(actorInfo.id, documentId, actorInfo.inbox, actorInfo.outbox, preferredUsername).run().then(
      (resp: D1Result) => {
        if (resp.success) {
          this.dbActorId = resp.meta.last_row_id
        } else {
          // TODO: Find an appropriate Error subclass - or create one.
        }
      },
    )

    this.message = actorInfo
    return this.message
  }
}

class AnnounceCFStorage extends CloudflareD1Database implements Kit.Database {
  protected readonly message: AP.Announce

  constructor(env: Kit.Configuration, message: AP.Announce) {
    super(env)
    this.message = message
  }

  remove(): boolean {
    // If from Mastodon - someone un-announced the post. We need to delete it from the store.
    const actorId = Kit.getEntityId(this.message.actor)

    const object = this.getDocument(this.message.object)
    if (object === undefined) {
      return false
    }

    const announceId = object.id
    if (announceId === null || announceId === undefined) {
      return false
    }

    console.log(`Attempting to delete Announce ${actorId} on ${announceId.toString()}`)

    let ok = false
    const stmtDel = this.handle.prepare('DELETE FROM announces WHERE message_id = ? AND actor_id = ?')
    void stmtDel.bind(announceId, actorId).run().then((resp: D1Result) => {
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
}

class FollowCFStorage extends CloudflareD1Database implements Kit.Database {
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
    const actorId = Kit.getEntityId(this.message.actor as EntityReference)!.toString()

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

    const _url = this.env.url().toString()
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
    const actorId = '' // TODO: this.env.getActorId(this.message.actor as EntityReference).toString()

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

class LikeCFStorage extends CloudflareD1Database implements Kit.Database {
  private readonly message: AP.Like

  constructor(env: Kit.Configuration, message: AP.Like) {
    super(env)
    this.message = message
  }

  remove(): boolean {
    // If from Mastodon - someone un-liked the post. We need to delete it from the store.
    const actorId = Kit.getEntityId(this.message.actor)

    const object = this.getDocument(this.message.object)
    if (object === undefined) {
      return false
    }

    const likedId = object.id
    if (likedId === null || likedId === undefined) {
      return false
    }

    console.log(`Attempting to delete Like ${actorId} on ${likedId.toString()}`)

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
  }

  exists(): boolean {
    throw new Kit.NotImplementedError()
  }

  retrieve(): undefined {
    throw new Kit.NotImplementedError()
  }
}

class NoteCFStorage extends CloudflareD1Database implements Kit.Database {
  private readonly message: AP.Note

  constructor(env: Kit.Configuration, message: AP.Note) {
    super(env)
    this.message = message
  }

  remove(): boolean {
    throw new Kit.NotImplementedError()
  }

  save(): boolean {
    console.log('Save Reply', this.message)

    if (this.message.id === null || this.message.id === undefined) {
      return false
    }

    const id = this.message.id.toString()
    const objectId = ((this.message as CoreObject).inReplyTo as URL).toString()

    let ok = false
    const stmtGet = this.handle.prepare('SELECT COUNT(*) AS count FROM replies WHERE Id = ? AND ObjectId = ?')
    void stmtGet.bind(id, objectId).run().then((resp: D1Result) => {
      if (resp.success && (resp.results[0] as DBCount).count > 0) {
        ok = true
      }
    })

    if (ok) {
      return true
    }

    console.log(`Adding reply message "${id}" to ${objectId}`)
    const stmtInsert = this.handle.prepare('INSERT INTO replies SET Id = ?, ObjectId = ?, Document = ?')
    void stmtInsert.bind(id, objectId, Json.stringify(this.message)).run().then((resp: D1Result) => {
      if (resp.success && resp.meta.rows_written === 1) {
        ok = true
      }
    })

    return ok
  }

  exists(): boolean {
    throw new Kit.NotImplementedError()
  }

  retrieve(): undefined {
    throw new Kit.NotImplementedError()
  }
}
