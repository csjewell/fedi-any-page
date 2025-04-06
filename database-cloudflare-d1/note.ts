/* SPDX-License-Identifier: MIT */
import { NotImplementedError } from '@csjewell-activitypub/general/errors'
import * as Json from '@csjewell-activitypub/json'
import { CloudflareD1Database } from './router.ts'
import type { default as Configuration } from '@csjewell-activitypub/general/configuration'
import type { Database } from '@csjewell-activitypub/general/database/handler'
import type * as AP from '@csjewell-activitypub/types'
import type { DBCount, DBId as _DBId } from './types.ts'

export class NoteCFStorage extends CloudflareD1Database implements Database {
  private readonly message : AP.Note
  private dbNoteId         : number | undefined = undefined

  constructor(env: Configuration, message: AP.Note) {
    super(env)
    this.message = message
  }

  databaseId(): number | undefined {
    return this.dbNoteId
  }

  document(): AP.Note {
    return this.message
  }

  // deno-lint-ignore require-await
  async remove(): Promise<boolean> {
    throw new NotImplementedError()
  }

  async save(): Promise<boolean> {
    console.log('Save Reply', this.message)

    if (this.message.id === null || this.message.id === undefined) {
      return false
    }

    const id = this.message.id.toString()
    const objectId = ((this.message as AP.CoreObject).inReplyTo as URL).toString()

    let ok = false
    const stmtGet = this.handle.prepare('SELECT COUNT(*) AS count FROM reply_notes WHERE id = ? AND object_id = ?')
      .bind(
        id,
        objectId,
      )
    const resp = await stmtGet.run()

    if (resp.success && (resp.results[0] as DBCount).count > 0) {
      ok = true
    }

    if (ok) {
      return true
    }

    console.log(`Adding reply message "${ id }" to ${ objectId }`)
    const stmtInsert = this.handle.prepare(`
      INSERT
        INTO reply_notes (id, object_id, document_id)
      VALUES             ( ?,         ?,           ?)
    `).bind(id, objectId, Json.stringify(this.message))
    const respInsert = await stmtInsert.run()

    if (respInsert.success && respInsert.meta.rows_written === 1) {
      ok = true
    }

    return ok
  }

  // deno-lint-ignore require-await
  async exists(): Promise<boolean> {
    throw new NotImplementedError()
  }

  // deno-lint-ignore require-await
  async retrieve(): Promise<unknown> {
    throw new NotImplementedError()
  }
}
