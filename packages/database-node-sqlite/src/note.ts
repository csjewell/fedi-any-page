/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { type Database, Json, NotImplementedError } from '@csjewell-activitypub/general'
import { SQLiteDatabase } from './database.ts'
import type { Keyv } from 'keyv'
import type { DatabaseSync } from 'node:sqlite'
import type * as AP from '@csjewell-activitypub/types'

export class NoteSQLiteStorage
  extends SQLiteDatabase
  implements Database.StorageHandler<AP.Note> {
  private readonly message : AP.Note
  private dbNoteId         : number | undefined = undefined

  constructor(cache: Keyv, handle: DatabaseSync, message: AP.Note) {
    super(cache, handle)
    this.message = message
  }

  databaseId = (): number | undefined => {
    return this.dbNoteId
  }

  document = (): AP.Note => {
    return this.message
  }

  remove = (): boolean => {
    throw new NotImplementedError()
  }

  save = (): boolean => {
    console.info('Save Reply', this.message)

    if (this.message.id === null || this.message.id === undefined) {
      return false
    }

    const id = this.message.id.toString()
    const objectId = ((this.message as AP.CoreObject).inReplyTo as URL).toString()

    let isOK = false
    const stmtGet = this.handle.prepare(`
      SELECT COUNT(*) AS count
        FROM reply_notes
       WHERE id = ?
         AND object_id = ?
    `)
    const resp = stmtGet.all(id, objectId)

    if ((resp[0] as { count: number }).count > 0) {
      isOK = true
    }

    if (isOK) {
      return true
    }

    console.info(`Adding reply message "${ id }" to ${ objectId }`)
    const stmtInsert = this.handle.prepare(`
      INSERT
        INTO reply_notes (id, object_id, document_id)
      VALUES             ( ?,         ?,           ?)
    `)
    const respInsert = stmtInsert.run(id, objectId, Json.stringify(this.message))

    if (respInsert.changes === 1) {
      isOK = true
      this.dbNoteId = respInsert.lastInsertRowid as number
    }

    return isOK
  }

  exists = (): boolean => {
    throw new NotImplementedError()
  }

  retrieve = (): AP.Note => {
    throw new NotImplementedError()
  }

  shorten = (): { url: URL | undefined; id: number | undefined } => {
    throw new NotImplementedError()
  }
}
