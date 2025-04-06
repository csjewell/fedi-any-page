/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
// deno-lint-ignore-file no-boolean-literal-for-arguments
import { Cuid } from '@dewars/cuid2'
import type { default as Keyv } from 'keyv'
import type { Database } from '../database/handler.ts'
import type { Session } from '../database/session.ts'
import type { AuthCookies } from './session-type.ts'

type SessionType = {
  username : string,
  actor    : string,
  expires  : number,
}

type SessionDB<TableT, SessionT> = Database<TableT> & Session<SessionT>
type ActorFunc = (u: string) => string

export default class MockSession implements SessionDB<void, AuthCookies> {
  private c        : Keyv
  private username : string
  private session  : SessionType | undefined = undefined
  private sessionKey = ''

  constructor(
    username: string,
    cache: Keyv,
    sessionKey = '',
  ) {
    this.username = username
    this.c = cache
    if (sessionKey !== '') {
      this.sessionKey = sessionKey
    }
  }

  databaseId(): undefined { return undefined }

  document(): void { return }

  save(): Promise<boolean> { return Promise.resolve(true) }

  shorten(): Promise<{ url: undefined, id: undefined }> {
    return Promise.resolve({ url: undefined, id: undefined, })
  }

  exists(): Promise<boolean> {
    return Promise.resolve(this.session !== undefined)
  }

  async remove(): Promise<boolean> {
    // TODO: [2025-04-08] Collect which values to delete and delete all at once.
    if (this.username !== '' && await this.c.has(`username:${ this.username }`)) {
      await this.c.delete(`username:${ this.username }`)
    }

    if (this.sessionKey !== '' && await this.c.has(this.sessionKey)) {
      await this.c.delete(this.sessionKey)
    }

    this.session = undefined
    return Promise.resolve(true)
  }

  async retrieve(...args: Array<unknown>): Promise<void> {
    const actorFunc = args[0] as ActorFunc
    let cookieId: string | undefined
    let isSessionSet: boolean

    if (await this.c.has(`username:${ this.username }`)) {
      cookieId = await this.c.get<string>(`username:${ this.username }`)
      this.sessionKey = cookieId ?? ''

      if (cookieId === undefined) {
        isSessionSet = false
      } else {
        isSessionSet = await this.c.has(cookieId)
      }
    } else {
      cookieId = await Cuid.create()
      this.sessionKey = cookieId
      await this.c.set<string>(`username:${ this.username }`, cookieId, 14400)
      isSessionSet = false
    }

    if (isSessionSet) {
      isSessionSet = await this._retrieveFromCache()
    }

    if (!isSessionSet) {
      this.session = {
        username : this.username,
        actor    : actorFunc(this.username),
        expires  : 0,
      }
      await this._setToCache()
    }

    return Promise.resolve()
  }

  /**
   * Refreshes the cache expiration if possible.
   *
   * @private
   */
  async _setToCache(): Promise<void> {
    if (this.session === undefined) {
      return
    }

    let expires = Date.now()

    expires += 8 * 3600 * 1000
    this.session.expires = expires
    await this.c.set<SessionType>(this.sessionKey, this.session, 14400)
  }

  /**
   * Retrieves the session from the cache.
   *
   * @returns {Promise<boolean>} We have a valid session if true
   *
   * @private
   */
  async _retrieveFromCache(): Promise<boolean> {
    if (this.sessionKey === '') {
      return false
    }

    const sessionData = await this.c.get<SessionType>(this.sessionKey)

    if (sessionData === undefined) {
      this.sessionKey = ''
      return false
    }

    if (sessionData.username !== this.username) {
      this.sessionKey = ''
      return false
    }

    this.session = sessionData
    return true
  }

  _assertSession(value: unknown): asserts value is SessionType {
    if (value === undefined || value === null || (value as SessionType).username !== this.username) {
      throw new TypeError('Not logged in')
    }
  }

  _toCookies(): AuthCookies {
    this._assertSession(this.session)
    return {
      actinfo : this.sessionKey,
      actinf  : {
        actor   : this.session.actor,
        expires : this.session.expires,
      },
    }
  }

  /* Session-specific vocabulary */
  invalidate(): Promise<boolean> { return this.remove() }

  async getCookies(actorFunc: ActorFunc): Promise<AuthCookies> {
    if (this.session === undefined) {
      await this.retrieve(actorFunc)
    }

    return this._toCookies()
  }

  // TODO: [2025-04-07] - Check actor parameter passed in versus actor contained in session
  valid(): Promise<void> { return Promise.resolve() }

  async refreshCookies(actorFunc: ActorFunc): Promise<AuthCookies> {
    await this._retrieveFromCache()

    if (this.session === undefined) {
      return this.getCookies(actorFunc)
    }

    await this._setToCache()
    return this._toCookies()
  }

  clearingCookies(): AuthCookies {
    return {
      actinf  : undefined,
      actinfo : undefined,
    }
  }
}

