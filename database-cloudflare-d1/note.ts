/* SPDX-License-Identifier: MIT */
import * as Json from '@csjewell-activitypub/json'
import * as Kit from '@csjewell-activitypub/general'
import type { AP } from 'activitypub-core-types'
import { CloudflareD1Database } from './router.ts'
import type { DBCount, DBId as _DBId } from './types.ts'

export class NoteCFStorage extends CloudflareD1Database implements Kit.Database {
  private readonly message: AP.Note

  constructor(env: Kit.Configuration, message: AP.Note) {
    super(env)
    this.message = message
  }

  remove(): boolean {
    throw new Kit.NotImplementedError()
  }

  save(): boolean {
    console.log('Save Reply', this.message)

    if (this.message.id === null || this.message.id === undefined) {
      return false
    }

    const id = this.message.id.toString()
    const objectId = ((this.message as AP.CoreObject).inReplyTo as URL).toString()

    let ok = false
    const stmtGet = this.handle.prepare('SELECT COUNT(*) AS count FROM replies WHERE Id = ? AND ObjectId = ?')
    void stmtGet.bind(id, objectId).run().then((resp: D1Result) => {
      if (resp.success && (resp.results[0] as DBCount).count > 0) {
        ok = true
      }
    })

    if (ok) {
      return true
    }

    console.log(`Adding reply message "${id}" to ${objectId}`)
    const stmtInsert = this.handle.prepare('INSERT INTO replies SET Id = ?, ObjectId = ?, Document = ?')
    void stmtInsert.bind(id, objectId, Json.stringify(this.message)).run().then((resp: D1Result) => {
      if (resp.success && resp.meta.rows_written === 1) {
        ok = true
      }
    })

    return ok
  }

  exists(): boolean {
    throw new Kit.NotImplementedError()
  }

  retrieve(): undefined {
    throw new Kit.NotImplementedError()
  }
}
