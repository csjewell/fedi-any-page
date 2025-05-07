/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import {
  type Database as APDatabase, Json, NotImplementedError, Utils,
} from '@csjewell-activitypub/general'
import * as AP from '@csjewell-activitypub/types'
import type { Database } from 'better-sqlite3'
import type { SQLiteDatabase } from './database.ts'

export class ActorSQLiteStorage
implements APDatabase.StorageHandler<AP.Actor> {
  /*
   * Store an Actor (a Person, Application, etc.) within the database
   */
  private readonly router : SQLiteDatabase
  private readonly handle : Database
  private message         : AP.ActorReference
  private _msgResolved    : AP.Actor | undefined
  private dbActorId       : number | undefined
  private dbDocumentId    : number | undefined

  constructor(router: SQLiteDatabase, message: AP.ActorReference) {
    this.router = router
    this.handle = this.router.handle
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

  remove = (): boolean => {
    if (!this.dbActorId || !this.dbDocumentId) {
      this.exists()
    }

    return this.removeActorQuick() && this.removeDocumentQuick()
  }

  private removeActorQuick = (): boolean => {
    if (this.dbActorId !== undefined) {
      const stmtDocument = this.handle.prepare('DELETE FROM actors WHERE id = ?')

      stmtDocument.run(this.dbActorId)
      this.dbActorId = undefined
    }

    return true
  }

  private removeDocumentQuick = (): boolean => {
    if (this.dbDocumentId !== undefined) {
      const stmtDocument = this.handle.prepare('DELETE FROM documents WHERE id = ?')

      stmtDocument.run(this.dbDocumentId)
      this.dbDocumentId = undefined
    }

    return true
  }

  save = async (): Promise<boolean> => {
    if (this.exists()) {
      return true
    }

    const actor = await this.retrieve()

    return actor !== undefined
  }

  exists = (): boolean => {
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
      const stmtActor = this.handle.prepare('SELECT id FROM actors WHERE actor_id = ?')
      const resp = stmtActor.all(checkId)

      if (resp.length === 1) {
        this.dbActorId = (resp[0] as { id: number }).id
      }
    }

    if (!this.dbDocumentId) {
      const stmtActor = this.handle.prepare('SELECT id FROM documents WHERE document_id = ?')
      const resp = stmtActor.all(checkId)

      if (resp.length === 1) {
        this.dbDocumentId = (resp[0] as { id: number }).id
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
    const stmtDocument = this.handle.prepare('INSERT INTO documents SET document_id = ?, type = ?, document = ?')

    const respDocument = stmtDocument.run(
      actorInfo.id.toString(),
      actorInfo.type.toString(),
      actorInfoJSON,
    )

    this.dbDocumentId = respDocument.lastInsertRowid as number

    const { preferredUsername, } = actorInfo
    const stmtActor = this.handle.prepare(
      'INSERT INTO actors SET actor_id = ?, document_id = ?, inbox = ?, outbox = ?, preferred_username = ?',
    )

    /* eslint-disable unicorn/consistent-destructuring */
    const respActor = stmtActor.run(
      actorInfo.id.toString(),
      this.dbDocumentId,
      (actorInfo.inbox as URL).toString(),
      (actorInfo.outbox as URL).toString(),
      preferredUsername ?? '',
    )

    this.dbActorId = respActor.lastInsertRowid as number
    this.message = actorInfo
    return this.message
  }

  shorten = (): { url: URL | undefined; id: number | undefined } => {
    throw new NotImplementedError()
  }
}
