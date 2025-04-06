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

  databaseId = (): undefined => { return undefined }

  exists = async (): Promise<boolean> => { return this.isExisting }

  document = (): undefined => { return undefined }

  remove = async (): Promise<boolean> => { return true }

  save = async (): Promise<boolean> => { return true }

  retrieve = async (): Promise<undefined> => { return undefined }

  shorten = async (): Promise<{ url: undefined, id: undefined }> => {
    return { url: undefined, id: undefined, }
  }

  checkPassword = async (pw: string): Promise<boolean> => {
    if (!this.isExisting) {
      return false
    }

    // Not worrying about emoji usernames, etc,
    /* eslint-disable-next-line @typescript-eslint/no-misused-spread */
    if (pw === [...this.username].reverse().join('')) {
      return true
    }

    return false
  }

  retrieveUser = (): User | undefined => {
    if (!this.isExisting) {
      return undefined
    }

    return { fullname: this.username, username: this.username, }
  }
}

