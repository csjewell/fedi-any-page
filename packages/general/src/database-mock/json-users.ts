/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */

import { StorageHandler } from '../database/router.ts'
import { UsersStorage } from '../database/users.ts'
import { User } from '../users.ts'
import BaseMockUsers from './base-mock-users.ts'

export default class JsonUsers extends BaseMockUsers implements StorageHandler<User>, UsersStorage {
  private users : Map<string, User>

  constructor(userinfo: string) {
    super()
    this.users = new Map()
    let parsedUsers: object = {}

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

      if (parsedUsers === null) {
        throw new SyntaxError('How did parsing the users return nothing?')
      }

    for (const [ k, v ] of Object.entries(parsedUsers)) {
      if (k !== '**' && k.search('[^-A-Za-z0-9.]') !== -1) {
        throw new SyntaxError('Username not valid')
      }

      const username = k.toLowerCase()

      if (typeof v !== 'object' || v === null || v === undefined || Array.isArray(v)) {
        throw new SyntaxError(`User not valid: ${ v.toString() }`)
      }

      Object.keys(v).forEach((key: string): void => {
        const ok = key === 'fullname' || key === 'homepage' || key === 'summary' || key === 'aliases'

        if (!ok) {
          throw new SyntaxError(`Extra key in user: ${ key }`)
        }
      })

      if (typeof v.fullname !== 'string') {
        throw new SyntaxError(`Name not valid in user: ${ v.fullname.toString() }`)
      }

      const userObj: User = { fullname: v.fullname, }

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

      this.users.set(username, userObj)
    }

    if (this.users.size === 0) {
      throw new SyntaxError('Parsing the users returned nothing')
    }
  }

  retrieve = async (...arguments_: Array<unknown>): Promise<User> => {
    const username = arguments_[0] as string
    if (!this.users.has(username)) {
      throw new TypeError(`Could not get the user ${ username }`)
    }
    return this.users.get(username) as User
  }

  exists = async (): Promise<boolean> => {
    return this.users.has(this.username)
  }

  existsUser = async (username: string): Promise<boolean> => {
    this.username = username.toLowerCase()
    return await this.exists()
  }

  checkPassword = async (_password: string): Promise<boolean> => {
    // TODO: [2025-04-12] Implement
    return false
  }
}
