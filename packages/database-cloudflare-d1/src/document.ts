/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { type Database, DataError, Json, Utils } from '@csjewell-activitypub/general'
import * as AP from '@csjewell-activitypub/types'
import { CloudflareD1Database } from './router.ts'
import type { CloudflareConfig } from './config.ts'
import type { DBId } from './types.ts'

export class DocumentCFStorage extends CloudflareD1Database implements Database.StorageHandler<AP.CoreObject> {
  private message         : AP.CoreObjectReference
  private resolvedMessage : AP.CoreObject | undefined = undefined
  private dbDocumentId    : number | undefined = undefined

  constructor(env: CloudflareConfig, message: AP.CoreObjectReference) {
    super(env)
    this.message = message
    if (AP.guard.isApCoreObject(this.message)) {
      this.resolvedMessage = this.message
    }
  }

  databaseId(): number | undefined {
    return this.dbDocumentId
  }

  document(): AP.CoreObject {
    if (this.resolvedMessage === undefined) {
      throw new DataError('Document not resolved yet')
    }

    return this.resolvedMessage
  }

  async remove(): Promise<boolean> {
    if (!this.dbDocumentId) {
      await this.exists()
    }

    const stmtDelete = this.handle.prepare('DELETE FROM documents WHERE id = ?').bind(this.dbDocumentId)

    await stmtDelete.run()
    this.dbDocumentId = undefined
    return true
  }

  async save(): Promise<boolean> {
    if (await this.exists()) {
      return true
    }

    const document = await this.retrieve()

    return document !== undefined
  }

  async exists(): Promise<boolean> {
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

    const stmtDocument = this.handle.prepare('SELECT id FROM documents WHERE document_id = ?').bind(checkId)
    const resp = await stmtDocument.run()

    if (resp.results.length === 1) {
      this.dbDocumentId = (resp.results[0] as DBId).id
    }

    return Boolean(this.dbDocumentId)
  }

  async retrieve(): Promise<AP.CoreObject | undefined> {
    // If we've already stored and resolved it, just return the resolved message
    if (this.dbDocumentId !== undefined && this.resolvedMessage !== undefined) {
      return this.resolvedMessage
    }

    // Check if it exists - if it does, and it is resolved already, return that message.
    if (await this.exists() && this.resolvedMessage !== undefined) {
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
      this.resolvedMessage = this.message
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
    `).bind(documentId, document.type, documentJSON)
    const respDocument = await stmtDocument.run()

    this.dbDocumentId = respDocument.meta.last_row_id
    return this.resolvedMessage
  }
}
