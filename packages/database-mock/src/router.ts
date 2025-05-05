/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { Database, NotImplementedError } from '@csjewell-activitypub/general'
import { AnyUsers } from './any-users.ts'
import { JsonUsers } from './json-users.ts'
import type { default as Keyv } from 'keyv'
import type * as AP from '@csjewell-activitypub/types'

export class DatabaseMock extends Database.SessionRouter implements Database.Router<Keyv> {
  private usersObj : AnyUsers | JsonUsers

  constructor(c: Keyv, users?: string) {
    super(c)
    this.usersObj = users === undefined ? new AnyUsers() : new JsonUsers(users)
  }

  dbHandle = (): Keyv => { return this.cache }
  announce = (): Database.StorageHandler<AP.Announce> => { throw new NotImplementedError() }
  follow = (): Database.StorageHandler<AP.Follow> => { throw new NotImplementedError() }
  like = (): Database.StorageHandler<AP.Like> => { throw new NotImplementedError() }
  note = (): Database.StorageHandler<AP.Note> => { throw new NotImplementedError() }
  actor = (): Database.StorageHandler<AP.Actor> => { throw new NotImplementedError() }
  documentEntry = (): Database.StorageHandler<AP.CoreObject> => { throw new NotImplementedError() }
  getDocument = (): Database.DBDocument => { throw new NotImplementedError() }
  sendToOutbox = (_usernameId: number, _actor: string, _message: AP.CoreObject): AP.OrPromise<boolean> => {
    throw new NotImplementedError()
  }

  users = (): AnyUsers | JsonUsers => {
    return this.usersObj
  }
}
