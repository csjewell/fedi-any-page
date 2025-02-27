/* SPDX-License-Identifier: MIT */
import { isTypeOf } from 'activitypub-core-types/lib/assertions/index.js'
import * as Json from '@csjewell-activitypub/json'
import * as Kit from '@csjewell-activitypub/general'
import { CloudflareD1Database } from './router.ts'
import { AP } from 'activitypub-core-types'
import type { DBId } from './types.ts'

export class ActorCFStorage extends CloudflareD1Database implements Kit.Database {
  private message: AP.ActorReference
  private dbActorId: number | undefined
  private dbDocumentId: number | undefined

  constructor(env: Kit.Configuration, message: AP.ActorReference) {
    super(env)
    this.message = message
    this.dbActorId = undefined
    this.dbDocumentId = undefined
  }

  remove(): boolean {
    if (!this.dbActorId || !this.dbDocumentId) {
      this.exists()
    }

    return this.removeActorQuick() && this.removeDocumentQuick()
  }

  private removeActorQuick(): boolean {
    let ok = false
    const stmtDocument = this.handle.prepare('DELETE FROM actors WHERE id = ?')
    void stmtDocument.bind(this.dbActorId).run().then((resp: D1Result) => {
      if (resp.success) {
        ok = true
        this.dbActorId = undefined
      }
    })

    return ok
  }

  private removeDocumentQuick(): boolean {
    let ok = false
    const stmtDocument = this.handle.prepare('DELETE FROM documents WHERE id = ?')
    void stmtDocument.bind(this.dbDocumentId).run().then((resp: D1Result) => {
      if (resp.success) {
        ok = true
        this.dbDocumentId = undefined
      }
    })

    return ok
  }

  save(): boolean {
    if (this.exists()) {
      return true
    }

    const actor = this.retrieve()
    return actor !== undefined
  }

  exists(): boolean {
    let checkId: string | undefined
    if (this.dbActorId !== undefined && this.dbDocumentId !== undefined) {
      return true
    }

    if (this.message instanceof URL) {
      checkId = this.message.toString()
    }

    if (isTypeOf(this.message as AP.Actor, AP.ActorTypes)) {
      const id = (this.message as AP.Actor).id
      if (id === null) {
        return false
      }

      checkId = Kit.entityRefToString(id)
    }

    if (checkId === undefined || checkId === null) {
      return false
    }

    if (!this.dbActorId) {
      const stmtActor = this.handle.prepare('SELECT id FROM actors WHERE actor_id = ?')
      void stmtActor.bind(checkId).run().then((resp: D1Result) => {
        if (resp.success && (resp.results.length === 1)) {
          this.dbActorId = (resp.results[0] as DBId).id
        }
      })
    }

    if (!this.dbDocumentId) {
      const stmtActor = this.handle.prepare('SELECT id FROM documents WHERE document_id = ?')
      void stmtActor.bind(checkId).run().then((resp: D1Result) => {
        if (resp.success && (resp.results.length === 1)) {
          this.dbDocumentId = (resp.results[0] as DBId).id
        }
      })
    }

    return (!!this.dbDocumentId && !!this.dbActorId)
  }

  retrieve(): AP.Actor | undefined {
    if (this.dbActorId !== undefined) {
      return this.message as AP.Actor
    }

    const er = isTypeOf(this.message as AP.Actor, AP.ActorTypes) ? (this.message as AP.Actor).id : this.message
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
    const stmtDocument = this.handle.prepare('INSERT INTO documents SET document_id = ?, type = ?, document = ?')

    void stmtDocument.bind(actorInfo.id, actorInfo.type, actorInfoJSON).run().then((resp: D1Result) => {
      if (resp.success) {
        this.dbDocumentId = resp.meta.last_row_id
      }
    })

    const preferredUsername = actorInfo.preferredUsername
    const stmtActor = this.handle.prepare(
      'INSERT INTO actors SET actor_id = ?, document_id = ?, inbox = ?, outbox = ?, preferred_username = ?',
    )
    void stmtActor.bind(actorInfo.id, this.dbDocumentId, actorInfo.inbox, actorInfo.outbox, preferredUsername).run()
      .then(
        (resp: D1Result) => {
          if (resp.success) {
            this.dbActorId = resp.meta.last_row_id
          } else {
            // TODO: Find an appropriate Error subclass - or create one.
          }
        },
      )

    this.message = actorInfo
    return <AP.Actor> this.message
  }
}
