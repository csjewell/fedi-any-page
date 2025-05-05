/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { type Database, Json, NotImplementedError, Utils } from '@csjewell-activitypub/general'
import * as AP from '@csjewell-activitypub/types'
import { CloudflareD1Database } from './router.ts'
import type { Keyv } from 'keyv'
import type { CloudflareConfig } from './config.ts'
import type { DBId } from './types.ts'

export class ActorCFStorage extends CloudflareD1Database implements Database.StorageHandler<AP.Actor> {
  /*
   * Store an Actor (a Person, Application, etc.) within the database
   */
  private message      : AP.ActorReference
  private _msgResolved : AP.Actor | undefined
  private dbActorId    : number | undefined
  private dbDocumentId : number | undefined

  constructor(cache: Keyv, env: CloudflareConfig, message: AP.ActorReference) {
    super(cache, env)
    this.message = message
    this._msgResolved = undefined
    this.dbActorId = undefined
    this.dbDocumentId = undefined
  }

  databaseId = (): number | undefined => {
    return this.dbActorId
  }

  document = (): AP.Actor => {
    throw new NotImplementedError()
  }

  remove = async (): Promise<boolean> => {
    if (!this.dbActorId || !this.dbDocumentId) {
      await this.exists()
    }

    return await this.removeActorQuick() && await this.removeDocumentQuick()
  }

  private removeActorQuick = async (): Promise<boolean> => {
    const stmtDocument = this.handle.prepare('DELETE FROM actors WHERE id = ?').bind(this.dbActorId)

    await stmtDocument.run()
    this.dbActorId = undefined
    return true
  }

  private removeDocumentQuick = async (): Promise<boolean> => {
    const stmtDocument = this.handle.prepare('DELETE FROM documents WHERE id = ?').bind(this.dbDocumentId)

    await stmtDocument.run()
    this.dbDocumentId = undefined
    return true
  }

  save = async (): Promise<boolean> => {
    if (await this.exists()) {
      return true
    }

    const actor = await this.retrieve()

    return actor !== undefined
  }

  exists = async (): Promise<boolean> => {
    let checkId: string | undefined

    if (this.dbActorId !== undefined && this.dbDocumentId !== undefined) {
      return true
    }

    if (this.message instanceof URL) {
      checkId = this.message.toString()
    }

    if (AP.guard.isApActor(this.message)) {
      const {id,} = this.message

      if (id === null) {
        return false
      }

      checkId = Utils.entityRefToString(id)
    }

    if (checkId === undefined) {
      return false
    }

    if (!this.dbActorId) {
      const stmtActor = this.handle.prepare('SELECT id FROM actors WHERE actor_id = ?').bind(checkId)
      const resp = await stmtActor.run()

      if (resp.results.length === 1) {
        this.dbActorId = (resp.results[0] as DBId).id
      }
    }

    if (!this.dbDocumentId) {
      const stmtActor = this.handle.prepare('SELECT id FROM documents WHERE document_id = ?').bind(checkId)
      const resp = await stmtActor.run()

      if (resp.results.length === 1) {
        this.dbDocumentId = (resp.results[0] as DBId).id
      }
    }

    return Boolean(this.dbDocumentId) && Boolean(this.dbActorId)
  }

  retrieve = async (): Promise<AP.Actor | undefined> => {
    if (this.dbActorId !== undefined) {
      return this.message as AP.Actor
    }

    const er = AP.guard.isApActor(this.message) ? this.message.id : this.message

    if (er === undefined || er === null) {
      return undefined
    }

    const actorURL = Utils.entityRefToURL(er)

    if (actorURL === undefined) {
      return undefined
    }

    actorURL.hash = ''

    console.info(`Retrieving actor message "${ actorURL.toString() }"`)
    const resp = await fetch(actorURL, {
      headers : {
        accept : 'application/activity+json, application/ld+json, application/json',
      },
      method   : 'GET',
      redirect : 'follow',
    })

    const actorInfoJSON = await resp.text()
    const actorInfo: AP.Actor = Json.parse<AP.Actor>(actorInfoJSON)

    if (actorInfo.id === null || actorInfo.id === undefined) {
      return undefined
    }

    if (actorInfo.id.toString() !== actorURL.toString()) {
      console.info(
        `Tried to retrieve actor at ${ actorURL.toString() } and got an actor at ${ actorInfo.id.toString() } instead`,
      )
      return undefined
    }

    console.info(`Storing actor message "${ actorURL.toString() }"`)
    const stmtDocument = this.handle.prepare('INSERT INTO documents SET document_id = ?, type = ?, document = ?').bind(
      actorInfo.id,
      actorInfo.type,
      actorInfoJSON,
    )
    const respDocument = await stmtDocument.run()

    this.dbDocumentId = respDocument.meta.last_row_id

    const {preferredUsername,} = actorInfo
    const stmtActor = this.handle.prepare(
      'INSERT INTO actors SET actor_id = ?, document_id = ?, inbox = ?, outbox = ?, preferred_username = ?',
    ).bind(
      /* eslint-disable-next-line unicorn/consistent-destructuring */
      actorInfo.id, this.dbDocumentId, actorInfo.inbox, actorInfo.outbox, preferredUsername,
    )
    const respActor = await stmtActor.run()

    this.dbActorId = respActor.meta.last_row_id
    this.message = actorInfo
    return this.message
  }
}
