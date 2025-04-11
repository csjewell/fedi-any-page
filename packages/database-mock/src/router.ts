/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { type Database, NotImplementedError, type Server } from '@csjewell-activitypub/general'
import { AnyUsers } from './any-users.ts'
import { MockSession } from './session.ts'
import type { default as Keyv } from 'keyv'
import type * as AP from '@csjewell-activitypub/types'

type AuthCookies = Server.RePliers.AuthInfo
export class DatabaseMock implements Database.Router<Keyv, AuthCookies> {
  private cache : Keyv

  // TODO: [2025-04-12] Pass in a string to create a JsonUsers, instead.
  constructor(c: Keyv) {
    this.cache = c
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

  users(): AnyUsers {
    return new AnyUsers()
  }

  async newSession(username: string, actorFunc: (u: string) => string): Promise<MockSession> {
    const sess = new MockSession(username, this.cache)

    await sess.retrieve(actorFunc)
    return sess
  }

  async session(username: string, sessionKey: string): Promise<MockSession> {
    const sess = new MockSession(username, this.cache, sessionKey)

    await sess._retrieveFromCache()
    return sess
  }
}
