/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { Cuid } from '@dewars/cuid2'
import type { default as Keyv } from 'keyv'
import type { Database, Server } from '@csjewell-activitypub/general'

type SessionType = {
  username : string;
  actor    : string;
  expires  : number;
}

type AuthCookies = Server.RePliers.AuthInfo
type SessionDB<SessionT> = Database.StorageHandler<SessionT> & Database.SessionStorage<SessionT>

export class MockSession implements SessionDB<AuthCookies> {
  private c        : Keyv
  private username : string
  private session  : SessionType | undefined = undefined
  private sessionKey = ''

  constructor(username: string, cache: Keyv, sessionKey = '') {
    this.username = username
    this.c = cache
    if (sessionKey !== '') {
      this.sessionKey = sessionKey
    }
  }

  databaseId = (): undefined => {
    return undefined
  }

  document = (): AuthCookies | undefined => {
    if (this.session === undefined) {
      return undefined
    }

    return this._toCookies()
  }

  save = async (): Promise<boolean> => {
    return await this._setToCache()
  }

  /* eslint-disable-next-line @typescript-eslint/require-await -- we are mocking routines that will! */
  shorten = async (): Promise<{ url: undefined; id: undefined }> => {
    return { url: undefined, id: undefined, }
  }

  /* eslint-disable-next-line @typescript-eslint/require-await -- we are mocking routines that will! */
  exists = async (): Promise<boolean> => {
    return this.session !== undefined
  }

  remove = async (): Promise<boolean> => {
    const deleteArray: Array<string> = []

    if (
      this.username !== ''
      && await this.c.has(`username:${ this.username }`)
    ) {
      deleteArray.push(`username:${ this.username }`)
    }

    if (this.sessionKey !== '' && await this.c.has(this.sessionKey)) {
      deleteArray.push(this.sessionKey)
    }

    if (deleteArray.length > 0) {
      await this.c.delete(deleteArray)
    }

    this.session = undefined
    return true
  }

  async retrieve(...args: Array<unknown>): Promise<AuthCookies> {
    const actorFunc = args[0] as Database.ActorFunc
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

    return this._toCookies()
  }

  /**
   * Refreshes the cache expiration if possible.
   *
   * @private
   */
  async _setToCache(): Promise<boolean> {
    if (this.session === undefined) {
      return false
    }

    let expires = Date.now()

    expires += 8 * 3600 * 1000
    this.session.expires = expires
    return await this.c.set<SessionType>(this.sessionKey, this.session, 14400)
  }

  /**
   * Retrieves the session from the cache.
   *
   * @returns {Promise<boolean>} We have a valid session if the Promise resolves to true
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

  /**
 * Asserts that the object passed in is a valid SessionType object.
 *
 * @private
 */
  private _assertSession(value: unknown): asserts value is SessionType {
    if (
      value === undefined
      || value === null
      || (value as SessionType).username !== this.username
    ) {
      throw new TypeError('Not logged in')
    }
  }

  /**
 * Converts the stored SessionType object to an AuthCookies object.
 * @returns {AuthCookies} An AuthCookies object.
 *
 * @private
 */
  private _toCookies(): AuthCookies {
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
  invalidate(): Promise<boolean> {
    return this.remove()
  }

  async getCookies(actorFunc: Database.ActorFunc): Promise<AuthCookies> {
    if (this.session === undefined) {
      await this.retrieve(actorFunc)
    }

    return this._toCookies()
  }

  /* eslint-disable-next-line @typescript-eslint/require-await -- we are mocking routines that will! */
  async valid(...arghs: Array<unknown>): Promise<boolean> {
    if (this.session === undefined) {
      return false
    }

    if (arghs.length !== 1) {
      throw new TypeError(
        'Checking validity requires passing an actor identifier',
      )
    }

    const actor = arghs[0] as string

    return this.session.actor === actor
  }

  /** Returns a refreshed AuthCookies object. */
  async refreshCookies(actorFunc: Database.ActorFunc): Promise<AuthCookies> {
    await this._retrieveFromCache()

    if (this.session === undefined) {
      return this.getCookies(actorFunc)
    }

    await this._setToCache()
    return this._toCookies()
  }

  /** Returns an AuthCookies object that refers to nothing. */
  clearingCookies(): AuthCookies {
    return {
      actinf  : undefined,
      actinfo : undefined,
    }
  }
}
