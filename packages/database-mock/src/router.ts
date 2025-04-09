/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { AnyUsers } from './any-users.ts'
import { MockSession } from './session.ts'
import type { default as Keyv } from 'keyv'
import type * as AP from '@csjewell-activitypub/types'
import type { DatabaseRouter, DBDocument, StorageHandler } from '../database/router.ts'
import type { AuthCookies } from './session-type.ts'

export class Database implements DatabaseRouter<Keyv, AuthCookies> {
  private cache : Keyv

  // TODO: [2025-04-10] Pass in a string to create a JsonUsers, instead.
  constructor(c: Keyv) {
    this.cache = c
  }

  dbHandle(): Keyv { return this.cache }
  announce(): StorageHandler<AP.Announce> { throw new Error('unimplemented') }
  follow(): StorageHandler<AP.Follow> { throw new Error('unimplemented') }
  like(): StorageHandler<AP.Like> { throw new Error('unimplemented') }
  note(): StorageHandler<AP.Note> { throw new Error('unimplemented') }
  actor(): StorageHandler<AP.Actor> { throw new Error('unimplemented') }
  documentEntry(): StorageHandler<AP.CoreObject> { throw new Error('unimplemented') }
  getDocument(): DBDocument { throw new Error('unimplemented') }

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
