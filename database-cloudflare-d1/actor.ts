/* SPDX-License-Identifier: MIT */
import * as Json from '@csjewell-activitypub/json'
import * as Kit from '@csjewell-activitypub/general'
import * as AP from '@csjewell-activitypub/types'
import { CloudflareD1Database } from './router.ts'
import type { DBId } from './types.ts'

export class ActorCFStorage extends CloudflareD1Database implements Kit.Database {
  /*
   * Store an Actor (a Person, Application, etc.) within the database
   */
  private message: AP.ActorReference
  private dbActorId: number | undefined
  private dbDocumentId: number | undefined

  constructor(env: Kit.Configuration, message: AP.ActorReference) {
    super(env)
    this.message = message
    this.dbActorId = undefined
    this.dbDocumentId = undefined
  }

  databaseId(): number | undefined {
    return this.dbActorId
  }

  document(): AP.ActorReference {
    return this.message
  }

  async remove(): Promise<boolean> {
    if (!this.dbActorId || !this.dbDocumentId) {
      await this.exists()
    }

    return await this.removeActorQuick() && await this.removeDocumentQuick()
  }

  private async removeActorQuick(): Promise<boolean> {
    let ok = false
    const stmtDocument = this.handle.prepare('DELETE FROM actors WHERE id = ?').bind(this.dbActorId)
    const resp = await stmtDocument.run()
    if (resp.success) {
      ok = true
      this.dbActorId = undefined
    }

    return ok
  }

  private async removeDocumentQuick(): Promise<boolean> {
    let ok = false
    const stmtDocument = this.handle.prepare('DELETE FROM documents WHERE id = ?').bind(this.dbDocumentId)
    const resp = await stmtDocument.run()
    if (resp.success) {
      ok = true
      this.dbDocumentId = undefined
    }

    return ok
  }

  async save(): Promise<boolean> {
    if (await this.exists()) {
      return true
    }

    const actor = await this.retrieve()
    return actor !== undefined
  }

  async exists(): Promise<boolean> {
    let checkId: string | undefined
    if (this.dbActorId !== undefined && this.dbDocumentId !== undefined) {
      return true
    }

    if (this.message instanceof URL) {
      checkId = this.message.toString()
    }

    if (AP.guard.isApActor(this.message)) {
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
      const stmtActor = this.handle.prepare('SELECT id FROM actors WHERE actor_id = ?').bind(checkId)
      const resp = await stmtActor.run()
      if (resp.success && (resp.results.length === 1)) {
        this.dbActorId = (resp.results[0] as DBId).id
      }
    }

    if (!this.dbDocumentId) {
      const stmtActor = this.handle.prepare('SELECT id FROM documents WHERE document_id = ?').bind(checkId)
      const resp = await stmtActor.run()
      if (resp.success && (resp.results.length === 1)) {
        this.dbDocumentId = (resp.results[0] as DBId).id
      }
    }

    return (!!this.dbDocumentId && !!this.dbActorId)
  }

  async retrieve(): Promise<AP.Actor | undefined> {
    if (this.dbActorId !== undefined) {
      return this.message as AP.Actor
    }

    const er = AP.guard.isApActor(this.message) ? (this.message as AP.Actor).id : this.message
    if (er === undefined || er === null) {
      return undefined
    }

    const actorURL = Kit.entityRefToURL(er)

    if (actorURL === undefined) {
      return undefined
    }

    actorURL.hash = ''

    console.log(`Retrieving actor message "${actorURL.toString()}"`)
    const resp = await fetch(actorURL, {
      headers: {
        accept: 'application/activity+json, application/ld+json, application/json',
      },
      method: 'GET',
      redirect: 'follow',
    })

    const actorInfoJSON = await resp.text()

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
    const stmtDocument = this.handle.prepare('INSERT INTO documents SET document_id = ?, type = ?, document = ?').bind(
      actorInfo.id,
      actorInfo.type,
      actorInfoJSON,
    )
    const respDocument = await stmtDocument.run()
    if (respDocument.success) {
      this.dbDocumentId = respDocument.meta.last_row_id
    }

    const preferredUsername = actorInfo.preferredUsername
    const stmtActor = this.handle.prepare(
      'INSERT INTO actors SET actor_id = ?, document_id = ?, inbox = ?, outbox = ?, preferred_username = ?',
    ).bind(actorInfo.id, this.dbDocumentId, actorInfo.inbox, actorInfo.outbox, preferredUsername)
    const respActor = await stmtActor.run()
    if (respActor.success) {
      this.dbActorId = respActor.meta.last_row_id
    } else {
      throw new Kit.DataError('I do not know.') // TODO:
    }

    this.message = actorInfo
    return <AP.Actor> this.message
  }
}
