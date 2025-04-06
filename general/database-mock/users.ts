/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
// deno-lint-ignore-file no-boolean-literal-for-arguments
import type { Database } from '../database/handler.ts'
import type { UsersDB } from '../database/users.ts'
import type { User } from '../users.ts'

export default class MockUsers implements Database<void>, UsersDB {
  private username   : string
  private isExisting : boolean

  constructor(username: string, isExisting = true ) {
    this.username = username
    this.isExisting = isExisting
  }

  databaseId = (): void => { return }

  exists = (): Promise<boolean> => { return Promise.resolve(this.isExisting) }

  document = (): void => { return }

  remove = (): Promise<boolean> => { return Promise.resolve(true) }

  save = (): Promise<boolean> => { return Promise.resolve(true) }

  retrieve = (): Promise<undefined> => { return Promise.resolve(undefined) }

  shorten = (): Promise<{ url: undefined, id: undefined }> => {
    return Promise.resolve({ url: undefined, id: undefined, })
  }

  checkPassword = (pw: string): Promise<boolean> => {
    if (!this.isExisting) {
      return Promise.resolve(false)
    }

    // Not worrying about emoji usernames, etc,
    /* eslint-disable-next-line @typescript-eslint/no-misused-spread */
    if (pw === [...this.username].reverse().join('')) {
      return Promise.resolve(true)
    }

    return Promise.resolve(false)
  }

  retrieveUser = (): User | undefined => {
    if (!this.isExisting) {
      return undefined
    }

    return { fullname: this.username, username: this.username, }
  }
}

