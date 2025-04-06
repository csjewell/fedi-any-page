/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import MockSession from './session.ts'
import MockUsers from './users.ts'
import type { default as Keyv } from 'keyv'
import type { Database } from '@csjewell-activitypub/general/database/handler'
import type { DatabaseRouter, DBDocument } from '@csjewell-activitypub/general/database/router'
import type { AuthCookies } from './session-type.ts'

export default class MockDatabase implements DatabaseRouter<Keyv, void, AuthCookies> {
  private cache : Keyv

  constructor(c: Keyv) {
    this.cache = c
  }

  dbHandle(): Keyv { return this.cache }
  announce(): Database<void> { throw new Error('unimplemented') }
  follow(): Database<void> { throw new Error('unimplemented') }
  like(): Database<void> { throw new Error('unimplemented') }
  note(): Database<void> { throw new Error('unimplemented') }
  actor(): Database<void> { throw new Error('unimplemented') }
  documentEntry(): Database<void> { throw new Error('unimplemented') }
  getDocument(): DBDocument { throw new Error('unimplemented') }

  users(username: string): MockUsers {
    if (username.length < 6) {
      return new MockUsers(username, false)
    }

    return new MockUsers(username, true)
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
