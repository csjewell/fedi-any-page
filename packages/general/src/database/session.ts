/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */

import { Cuid } from '@dewars/cuid2'
import * as v from '@valibot/valibot'
import { SessionError } from '../errors.ts'
import type { Keyv } from 'keyv'
import type * as AP from '@csjewell-activitypub/types'
import type { Cookies } from '../cookies.ts'
import type { ActorFunc, StorageHandler } from './router.ts'

/**
 * Additional methods the session storage needs to implement.
 */
export type SessionStorage = {
  /** Invalidates the current session */
  invalidate      : () => Promise<boolean>
  /** Is the current session valid? */
  valid           : (...args: Array<unknown>) => Promise<boolean>
  /** Get a representation of what the cookies should be for the current session */
  getCookies      : () => Promise<Cookies>
  /** Refresh the current session and return what the cookies should be */
  refreshCookies  : () => Promise<Cookies>
  /** Return a representation of what the cookies should be that should clear them. */
  clearingCookies : () => Cookies
  /** Returns the current user as an AP.ActorReference to use in AP documents */
  getActor        : () => Promise<AP.ActorReference>

}

/**
 * The inputs from the session cookie.
 *
 * @property actor - The "actor URL" of the current user.
 */
export const SessionInfoSchema = v.strictObject({
  username      : v.optional(v.string()),
  actor         : v.optional(v.pipe(v.string(), v.url())),
  followersLink : v.optional(v.pipe(v.string(), v.url())),
  isVerified    : v.boolean(),
  expires       : v.optional(v.number()),
})
export type SessionInfo = v.InferOutput<typeof SessionInfoSchema>

// Used as what to 'implements'
export type SessionDB = StorageHandler<SessionInfo> & SessionStorage

export class SessionCache implements SessionDB {
  private cache      : Keyv
  private username   : string
  private sessionKey : string
  private session    : SessionInfo | undefined = undefined

  constructor(cache: Keyv, username: string, sessionKey = '') {
    this.cache = cache
    this.username = username
    this.sessionKey = sessionKey
  }

  databaseId = (): undefined => {
    return undefined
  }

  document = (): SessionInfo | undefined => {
    return this.session
  }

  save = async (...arghs: Array<unknown>): Promise<boolean> => {
    const actorFunc = arghs[0] as ActorFunc

    const actor = actorFunc(this.username)

    this.session = {
      username      : this.username,
      isVerified    : true,
      followersLink : `${ actor }/followers`,
      actor,
    }

    this.sessionKey = await Cuid.create()
    await this.cache.set<string>(`username:${ this.username }`, this.sessionKey, 14400)
    return this.setToCache()
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
      && await this.cache.has(`username:${ this.username }`)
    ) {
      deleteArray.push(`username:${ this.username }`)
    }

    if (this.sessionKey !== '' && await this.cache.has(this.sessionKey)) {
      deleteArray.push(this.sessionKey)
    }

    if (deleteArray.length > 0) {
      await this.cache.delete(deleteArray)
    }

    this.session = undefined
    return true
  }

  retrieve = async (): Promise<SessionInfo> => {
    let cookieId: string | undefined
    let isSessionSet: boolean

    if (await this.cache.has(`username:${ this.username }`)) {
      cookieId = await this.cache.get<string>(`username:${ this.username }`)
      this.sessionKey = cookieId ?? ''

      if (cookieId === undefined) {
        isSessionSet = false
      } else {
        isSessionSet = await this.cache.has(cookieId)
      }
    } else {
      cookieId = await Cuid.create()
      this.sessionKey = cookieId
      await this.cache.set<string>(`username:${ this.username }`, cookieId, 14400)
      isSessionSet = false
    }

    if (isSessionSet) {
      isSessionSet = await this.retrieveFromCache()
    }

    if (!isSessionSet || this.session === undefined) {
      throw new TypeError('User is not logged in')
    }

    return this.session
  }

  /* eslint-disable-next-line @typescript-eslint/require-await -- we are mocking routines that will! */
  valid = async (): Promise<boolean> => this.isSessionInfo(this.session)

  /**
   * Refreshes the cache expiration if possible.
   *
   * @private
   */
  private setToCache = async (): Promise<boolean> => {
    if (this.session === undefined) {
      return false
    }

    let expires = Date.now()

    expires += 8 * 3600 * 1000
    this.session.expires = expires
    return await this.cache.set<SessionInfo>(this.sessionKey, this.session, 14400)
  }

  /**
   * Retrieves the session from the cache.
   *
   * @returns {Promise<boolean>} We have a valid session if the Promise resolves to true
   *
   * @private
   */
  private retrieveFromCache = async (): Promise<boolean> => {
    if (this.sessionKey === '') {
      return false
    }

    const sessionData = await this.cache.get<SessionInfo>(this.sessionKey)

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
   * Tests that the object passed in is a valid SessionType object.
   *
   * @private
   */
  private isSessionInfo: (value: unknown) => value is SessionInfo
    = (value): value is SessionInfo => {
      return value !== undefined
        && value !== null
        && v.is<typeof SessionInfoSchema>(SessionInfoSchema, value)
        && value.username === this.username
    }

  /**
   * Asserts that the object passed in is a valid SessionType object.
   *
   * @private
   */
  private assertSessionInfo: (value: unknown) => asserts value is SessionInfo
    = (value) => {
      if (!this.isSessionInfo(value)) {
        throw new TypeError('Not logged in')
      }
    }

  /* Session-specific vocabulary */
  invalidate = (): Promise<boolean> => this.remove()

  /**
   * Gets what should be stored in the cookies
   */
  getCookies = async (): Promise<Cookies> => {
    if (this.session === undefined) {
      await this.retrieve()
    }

    return this._getCookies()
  }

  private _getCookies = (): Cookies => {
    if (this.session === undefined ) {
      return this.clearingCookies()
    }

    this.assertSessionInfo(this.session)
    return {
      actinf  : this.session.username,
      actinfo : this.sessionKey,
    }
  }

  /** Returns a refreshed Cookies object. */
  refreshCookies = async (): Promise<Cookies> => {
    await this.retrieveFromCache()
    await this.setToCache()
    return this._getCookies()
  }

  /** Returns a Cookies object that refers to nothing. */
  clearingCookies = (): Cookies => {
    return {
      actinf  : '',
      actinfo : '',
    }
  }

  getActor = async (): Promise<AP.ActorReference> => {
    if (this.session === undefined) {
      await this.retrieve()
    }

    if (this.session?.actor === undefined) {
      throw new Error('Session error')
    }

    return new URL(this.session.actor)
  }
}

/**
 * Implements newSession and session methods for all routers.
 */
export class SessionRouter {
  protected cache : Keyv

  constructor(cache: Keyv) {
    this.cache = cache
  }

  newSession = async (username: string, func: ActorFunc): Promise<SessionCache> => {
    if (await this.cache.has(`username:${ username }`)) {
      const sessionKey = await this.cache.get<string>(`username:${ username }`)

      if (sessionKey !== undefined) {
        return this.session({ actinf: username, actinfo: sessionKey, })
      }
    }

    const sess = new SessionCache(this.cache, username)

    await sess.save(func)
    return sess
  }

  session = async (cookies: Cookies): Promise<SessionCache> => {
    if (cookies.actinf === undefined || cookies.actinfo === undefined) {
      throw new SessionError()
    }

    const sess = new SessionCache(this.cache, cookies.actinf, cookies.actinfo)

    await sess.retrieve()
    return sess
  }
}

