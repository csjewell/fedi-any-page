/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { type Database as APDatabase, Json, NotImplementedError } from '@csjewell-activitypub/general'
import type { Database } from 'better-sqlite3'
import type * as AP from '@csjewell-activitypub/types'
import type { SQLiteDatabase } from './database.ts'

export class NoteSQLiteStorage
implements APDatabase.StorageHandler<AP.Note> {
  private readonly router  : SQLiteDatabase
  private readonly handle  : Database
  private readonly message : AP.Note
  private dbNoteId         : number | undefined = undefined

  constructor(router: SQLiteDatabase, message: AP.Note) {
    this.router = router
    this.handle = this.router.handle
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
