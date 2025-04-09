/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */

import { BaseMockUsers } from './base-mock-users.ts'
import type { Database, User } from '@csjewell-activitypub/general'

type ExtendedUser = Omit<User, 'username'> & {
  password : string
}

type ExtendedUserRead = Omit<User, 'username'> & {
  password : string | undefined
}

export class JsonUsers extends BaseMockUsers implements Database.UsersStorage {
  private users : Map<string, ExtendedUser>

  constructor(userinfo: string) {
    super()
    this.users = new Map()
    let parsedUsers: object = {}

    if (userinfo === '') {
      throw new SyntaxError('Cannot parse an empty string?')
    }

    try {
      parsedUsers = JSON.parse(userinfo) as object
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new SyntaxError('SyntaxError parsing user information', { cause: error, })
      }
      if (error instanceof TypeError) {
        throw new SyntaxError('TypeError parsing user information', { cause: error, })
      }
    }

    // TODO: Implement using valibot
    /* eslint-disable */
    for (const [ k, v ] of Object.entries(parsedUsers)) {
      if (k !== '**' && k.search('[^-A-Za-z0-9.]') !== -1) {
        throw new SyntaxError('Username not valid')
      }

      const username = k.toLowerCase()

      if (typeof v !== 'object' || v === null || v === undefined || Array.isArray(v)) {
        throw new SyntaxError(`User not valid: ${ v.toString() }`)
      }

      Object.keys(v).forEach((key: string): void => {
        const ok = key === 'fullname' || key === 'homepage' || key === 'summary' || key === 'aliases' || key === 'password'

        if (!ok) {
          throw new SyntaxError(`Extra key in user: ${ key }`)
        }
      })

      if (typeof v.fullname !== 'string') {
        throw new SyntaxError(`Name not valid in user: ${ v.fullname.toString() }`)
      }

      const userObj: ExtendedUserRead = { fullname: v.fullname, password: undefined, }

      if (!(v.homepage === undefined || typeof v.homepage === 'string')) {
        throw new SyntaxError(`Homepage not valid in user: ${ v.homepage.toString() }`)
      }

      if (v.homepage) {
        userObj.homepage = v.homepage
      }

      if (!(v.summary === undefined || typeof v.summary === 'string')) {
        throw new SyntaxError(`Summary not valid in user: ${ v.summary.toString() }`)
      }

      if (v.summary) {
        userObj.summary = v.summary
      }

      if (!(v.password === undefined || typeof v.password !== 'string')) {
        throw new SyntaxError('Password not valid in user')
      }

      if (v.password) {
        userObj.password = v.password
      }

      if (!(v.aliases === undefined || Array.isArray(v.aliases))) {
        throw new SyntaxError(`Aliases not valid in user: ${ v.aliases.toString() }`)
      }

      if (v.aliases) {
        for (const alias of v.aliases) {
          if (typeof alias !== 'string') {
            throw new SyntaxError(`Alias not valid in user aliases: ${ alias.toString() }`)
          }

          //          if (alias.search('@\w+[.]\w+') < 1) {
          //            throw new SyntaxError(`Alias not valid in user aliases (no @ sign or no domain after it): ${alias}`)
          //          }
        }

        userObj.aliases = v.aliases
      }

      this.users.set(username, userObj as ExtendedUser)
    }
    /* eslint-enable */

    if (this.users.size === 0) {
      throw new SyntaxError('Parsing the users returned nothing')
    }
  }

  /* eslint-disable-next-line @typescript-eslint/require-await -- We are mocking a routine that COULD await. */
  retrieve = async (...arguments_: Array<unknown>): Promise<User> => {
    const username = (arguments_[0] as string).toLowerCase()

    if (!this.users.has(username)) {
      throw new TypeError(`Could not get the user ${ username }`)
    }

    this.username = username
    const eUser = this.users.get(username)
    const { fullname, homepage, summary, aliases, dId, } = eUser as ExtendedUser

    return { username, fullname, homepage, summary, aliases, dId, }
  }

  /* eslint-disable-next-line @typescript-eslint/require-await -- We are mocking a routine that COULD await. */
  exists = async (): Promise<boolean> => {
    return this.users.has(this.username)
  }

  existsUser = async (username: string): Promise<boolean> => {
    this.username = username.toLowerCase()
    return await this.exists()
  }

  /* eslint-disable-next-line @typescript-eslint/require-await -- We are mocking a routine that COULD await. */
  checkPassword = async (pwToCheck: string): Promise<boolean> => {
    if (!this.users.has(this.username)) {
      throw new TypeError(`Could not get the user ${ this.username }`)
    }

    const eUser = this.users.get(this.username)
    const { password, } = eUser as ExtendedUser

    return pwToCheck === password
  }
}
