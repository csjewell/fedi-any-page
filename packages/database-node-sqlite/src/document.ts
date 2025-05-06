/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import {
  type Database, DataError, Json, NotImplementedError, Utils,
} from '@csjewell-activitypub/general'
import * as AP from '@csjewell-activitypub/types'
import { SQLiteDatabase } from './database.ts'
import type { Keyv } from 'keyv'
import type { DatabaseSync } from 'node:sqlite'

export class DocumentSQLiteStorage
  extends SQLiteDatabase
  implements Database.StorageHandler<AP.CoreObject> {
  private message         : AP.CoreObjectReference | AP.LinkReference
  private resolvedMessage : AP.CoreObject | undefined = undefined
  private dbDocumentId    : number | undefined = undefined

  constructor(
    cache: Keyv,
    handle: DatabaseSync,
    message: AP.CoreObjectReference | AP.LinkReference,
  ) {
    super(cache, handle)
    this.message = message
    if (AP.guard.isApCoreObject(this.message)) {
      this.resolvedMessage = this.message
    }
  }

  databaseId = (): number | undefined => {
    return this.dbDocumentId
  }

  document = (): AP.CoreObject => {
    if (this.resolvedMessage === undefined) {
      throw new DataError('Document not resolved yet')
    }

    return this.resolvedMessage
  }

  remove = (): boolean => {
    if (!this.dbDocumentId) {
      this.exists()
    }

    if (!this.dbDocumentId) {
      return false
    }

    const stmtDelete = this.handle.prepare('DELETE FROM documents WHERE id = ?')

    stmtDelete.run(this.dbDocumentId)
    this.dbDocumentId = undefined
    return true
  }

  save = async (): Promise<boolean> => {
    if (this.exists()) {
      return true
    }

    const document = await this.retrieve()

    return document !== undefined
  }

  exists = (): boolean => {
    let checkId: string | undefined

    if (this.dbDocumentId !== undefined) {
      return true
    }

    if (this.message instanceof URL) {
      checkId = this.message.toString()
    }

    if (AP.guard.isApCoreObject(this.message)) {
      this.resolvedMessage = this.message
      const { id, } = this.message

      if (id === null) {
        return false
      }

      checkId = Utils.entityRefToString(id)
    }

    if (checkId === undefined) {
      return false
    }

    const stmtDocument = this.handle.prepare(`
      SELECT id FROM documents WHERE document_id = ?
    `)
    const resp = stmtDocument.all(checkId)

    if (resp.length === 1) {
      this.dbDocumentId = (resp[0] as { id: number }).id
    }

    return Boolean(this.dbDocumentId)
  }

  retrieve = async (): Promise<AP.CoreObject | undefined> => {
    // If we've already stored and resolved it, just return the resolved message
    if (this.dbDocumentId !== undefined && this.resolvedMessage !== undefined) {
      return this.resolvedMessage
    }

    // Check if it exists - if it does, and it is resolved already, return that message.
    if (this.exists() && this.resolvedMessage !== undefined) {
      return this.resolvedMessage
    }

    // TODO: [2025-04-12] Try to get the document from the database

    // Try and get the document from the web and store it.
    let document: AP.CoreObject
    let documentJSON: string

    if (this.message instanceof URL) {
      const documentURL = this.message

      documentURL.hash = ''

      console.info(`Retrieving actor message "${ documentURL.toString() }"`)
      const resp = await fetch(documentURL, {
        headers : {
          accept : 'application/activity+json, application/ld+json, application/json',
        },
        method   : 'GET',
        redirect : 'follow',
      })

      documentJSON = await resp.text()
      /* TODO: QUESTION: Could it be a LinkObject? */
      document = Json.parse<AP.CoreObject>(documentJSON)

      if (document.id === null || document.id === undefined) {
        return undefined
      }

      if (document.id.toString() !== documentURL.toString()) {
        console.error(
          `Tried to retrieve document at ${ documentURL.toString() } and got a document at ${ document.id.toString() } instead`,
        )
        return undefined
      }

      this.resolvedMessage = document
    } else {
      /* TODO: [2025-05-12] Check for LinkObjects */
      this.resolvedMessage = this.message as AP.CoreObject
      document = this.resolvedMessage
      documentJSON = Json.stringify(document)

      if (document.id === null || document.id === undefined) {
        console.error(`tried to store document without an id: ${ documentJSON }`)
        return undefined
      }
    }

    const documentId = document.id.toString()

    console.info(`Storing document "${ documentId }"`)
    const stmtDocument = this.handle.prepare(`
      INSERT
        INTO documents (document_id, type, document)
      VALUES           (          ?,    ?,        ?)
    `)
    const respDocument = stmtDocument.run(
      documentId, document.type.toString(), documentJSON)

    this.dbDocumentId = respDocument.lastInsertRowid as number
    return this.resolvedMessage
  }

  shorten = (): { url: URL | undefined; id: number | undefined } => {
    throw new NotImplementedError()
  }
}
