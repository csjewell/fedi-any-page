/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { type Database, Json, NotImplementedError } from '@csjewell-activitypub/general'
import { CloudflareD1Database } from './router.ts'
import type { Keyv } from 'keyv'
import type * as AP from '@csjewell-activitypub/types'
import type { CloudflareConfig } from './config.ts'
import type { DBCount } from './types.ts'

export class NoteCFStorage extends CloudflareD1Database implements Database.StorageHandler<AP.Note> {
  private readonly message : AP.Note
  private dbNoteId         : number | undefined = undefined

  constructor(cache: Keyv, env: CloudflareConfig, message: AP.Note) {
    super(cache, env)
    this.message = message
  }

  databaseId = (): number | undefined => {
    return this.dbNoteId
  }

  document = (): AP.Note => {
    return this.message
  }

  /* eslint-disable-next-line @typescript-eslint/require-await -- Not implemented yet */
  remove = async (): Promise<boolean> => {
    throw new NotImplementedError()
  }

  save = async (): Promise<boolean> => {
    console.info('Save Reply', this.message)

    if (this.message.id === null || this.message.id === undefined) {
      return false
    }

    const id = this.message.id.toString()
    const objectId = ((this.message as AP.CoreObject).inReplyTo as URL).toString()

    let isOK = false
    const stmtGet = this.handle.prepare('SELECT COUNT(*) AS count FROM reply_notes WHERE id = ? AND object_id = ?')
      .bind(
        id,
        objectId,
      )
    const resp = await stmtGet.run()

    if ((resp.results[0] as DBCount).count > 0) {
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
    `).bind(id, objectId, Json.stringify(this.message))
    const respInsert = await stmtInsert.run()

    if (respInsert.meta.rows_written === 1) {
      isOK = true
    }

    return isOK
  }

  /* eslint-disable-next-line @typescript-eslint/require-await -- Not implemented yet */
  exists = async (): Promise<boolean> => {
    throw new NotImplementedError()
  }

  /* eslint-disable-next-line @typescript-eslint/require-await -- Not implemented yet */
  retrieve = async (): Promise<AP.Note> => {
    throw new NotImplementedError()
  }
}
