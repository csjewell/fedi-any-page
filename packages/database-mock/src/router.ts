/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { SQLiteDatabase } from '@csjewell-activitypub/database-node-sqlite'
import { AnyUsers } from './any-users.ts'
import { JsonUsers } from './json-users.ts'
import type { default as Keyv } from 'keyv'
import type { DatabaseSync } from 'node:sqlite'
import type { Database } from '@csjewell-activitypub/general'

export class DatabaseMock
  extends SQLiteDatabase
  implements Database.Router<DatabaseSync> {
  private usersObj : AnyUsers | JsonUsers

  constructor(c: Keyv, users?: string) {
    super(c, ':memory:')
    this.usersObj = users === undefined ? new AnyUsers() : new JsonUsers(users)
  }

  override users = (): AnyUsers | JsonUsers => {
    return this.usersObj
  }
}
