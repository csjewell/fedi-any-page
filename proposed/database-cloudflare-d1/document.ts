/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import * as Kit from '@csjewell-activitypub/general'
import * as Json from '@csjewell-activitypub/json'
import * as AP from '@csjewell-activitypub/types'
import { CloudflareD1Database } from './router.ts'
import type { default as Configuration } from '@csjewell-activitypub/general/configuration'
import type { Database } from '@csjewell-activitypub/general/database/handler'
import type { DBId } from './types.ts'

export class DocumentCFStorage extends CloudflareD1Database implements Database {
  private message      : AP.CoreObjectReference
  private dbDocumentId : number | undefined = undefined

  constructor(env: Configuration, message: AP.CoreObject) {
    super(env)
    this.message = message
  }

  databaseId(): number | undefined {
    return this.dbDocumentId
  }

  document(): AP.CoreObjectReference {
    return this.message
  }

  async remove(): Promise<boolean> {
    if (!this.dbDocumentId) {
      await this.exists()
    }

    let ok = false
    const stmtDelete = this.handle.prepare('DELETE FROM documents WHERE id = ?').bind(this.dbDocumentId)
    const resp = await stmtDelete.run()

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
      const {id,} = this.message as AP.CoreObject

      if (id === null) {
        return false
      }

      checkId = Kit.entityRefToString(id)
    }

    if (checkId === undefined || checkId === null) {
      return false
    }

    if (!this.dbDocumentId) {
      const stmtDocument = this.handle.prepare('SELECT id FROM documents WHERE document_id = ?').bind(checkId)
      const resp = await stmtDocument.run()

      if (resp.success && resp.results.length === 1) {
        this.dbDocumentId = (resp.results[0] as DBId).id
      }
    }

    return Boolean(this.dbDocumentId)
  }

  async retrieve(): Promise<AP.CoreObject | undefined> {
    if (this.dbDocumentId !== undefined) {
      return this.message as AP.CoreObject
    }

    let document: AP.CoreObject
    let documentJSON: string

    if (this.message instanceof URL) {
      const documentURL = this.message

      documentURL.hash = ''

      console.log(`Retrieving actor message "${ documentURL.toString() }"`)
      const resp = await fetch(documentURL, {
        headers : {
          accept : 'application/activity+json, application/ld+json, application/json',
        },
        method   : 'GET',
        redirect : 'follow',
      })

      documentJSON = await resp.text()

      if (documentJSON === undefined) {
        return undefined
      }

      document = Json.parse(documentJSON) as AP.CoreObject

      if (document.id === null || document.id === undefined) {
        return undefined
      }

      if (document.id.toString() !== documentURL.toString()) {
        console.log(
          `Tried to retrieve document at ${ documentURL.toString() } and got a document at ${ document.id.toString() } instead`,
        )
        return undefined
      }

      this.message = document
    } else {
      document = this.message
      documentJSON = Json.stringify(document)
    }

    console.log(`Storing document "${ document.id!.toString() }"`)
    const stmtDocument = this.handle.prepare(`
      INSERT
        INTO documents (document_id, type, document)
      VALUES           (          ?,    ?,        ?)
    `).bind(document.id!.toString(), document.type, documentJSON)
    const respDocument = await stmtDocument.run()

    if (respDocument.success) {
      this.dbDocumentId = respDocument.meta.last_row_id
    }

    return this.message as AP.CoreObject
  }
}
