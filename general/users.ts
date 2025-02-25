/* SPDX-License-Identifier: MIT */
import { parse } from '@std/jsonc'

/*
 */
export type User = {
  fullname: string
  homepage?: string
  summary?: string
  username?: string
  aliases?: Array<string>
}

export class Users {
  private users: Map<string, User>

  constructor(userinfo: string) {
    this.users = new Map()
    let parsedUsers: object = {}
    try {
      parsedUsers = <object> parse(userinfo)
    } catch (caught) {
      if (caught instanceof SyntaxError) {
        throw new SyntaxError('SyntaxError parsing user information', { cause: caught })
      }
      if (caught instanceof TypeError) {
        throw new SyntaxError('TypeError parsing user information', { cause: caught })
      }
    }

    if (parsedUsers === null) {
      throw new SyntaxError('How did parsing the users return nothing?')
    }

    for (const [k, v] of Object.entries(parsedUsers)) {
      if (k.search('[^-A-Za-z0-9.]') !== -1) {
        throw new SyntaxError('Username not valid')
      }

      const username = k.toLowerCase()

      if (typeof v !== 'object' || v === null || v === undefined || Array.isArray(v)) {
        throw new SyntaxError(`User not valid: ${v.toString()}`)
      }

      Object.keys(v).forEach(function (key: string): void {
        const ok = key === 'fullname' || key === 'homepage' || key === 'summary' || key === 'aliases'
        if (!ok) {
          throw new SyntaxError(`Extra key in user: ${key}`)
        }
      })

      if (typeof v.fullname !== 'string') {
        throw new SyntaxError(`Name not valid in user: ${v.fullname.toString()}`)
      }

      const userObj: User = { fullname: v.fullname }

      if (!(v.homepage === undefined || typeof v.homepage === 'string')) {
        throw new SyntaxError(`Homepage not valid in user: ${v.homepage.toString()}`)
      }

      if (v.homepage) {
        userObj.homepage = v.homepage
      }

      if (!(v.summary === undefined || typeof v.summary === 'string')) {
        throw new SyntaxError(`Summary not valid in user: ${v.summary.toString()}`)
      }

      if (v.summary) {
        userObj.summary = v.summary
      }

      if (!(v.aliases === undefined || Array.isArray(v.aliases))) {
        throw new SyntaxError(`Aliases not valid in user: ${v.aliases.toString()}`)
      }

      if (v.aliases) {
        for (const alias of v.aliases) {
          if (typeof alias !== 'string') {
            throw new SyntaxError(`Alias not valid in user aliases: ${alias.toString()}`)
          }

          if (alias.search('@\w+[.]\w+') < 1) {
            throw new SyntaxError(`Alias not valid in user aliases (no @ sign or no domain after it): ${alias}`)
          }
        }

        userObj.aliases = v.aliases
      }

      this.users.set(username, userObj)
    }

    if (this.users.size === 0) {
      throw new SyntaxError('Parsing the users returned nothing')
    }
  }

  retrieveUser(un: string): User | undefined {
    const username = un.toLowerCase()
    const user: User | undefined = this.users.get(username) ?? undefined
    if (user === undefined) {
      return undefined
    }

    // Slip the username into the object we return so that people can get it back.
    const newUser: User = { username, ...user }
    return newUser
  }

  existsUser(username: string): boolean {
    return this.users.has(username.toLowerCase())
  }
}
