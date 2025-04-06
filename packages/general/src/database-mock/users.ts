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

  constructor(username: string, isExisting = true) {
    this.username = username
    this.isExisting = isExisting
  }

  databaseId = (): undefined => {
    return undefined
  }

  document = (): undefined => {
    return undefined
  }

  /* eslint-disable-next-line @typescript-eslint/require-await -- we are mocking routines that will! */
  exists = async (): Promise<boolean> => {
    return this.isExisting
  }

  /* eslint-disable-next-line @typescript-eslint/require-await -- we are mocking routines that will! */
  remove = async (): Promise<boolean> => {
    return true
  }

  /* eslint-disable-next-line @typescript-eslint/require-await -- we are mocking routines that will! */
  save = async (): Promise<boolean> => {
    return true
  }

  /* eslint-disable-next-line @typescript-eslint/require-await -- we are mocking routines that will! */
  retrieve = async (): Promise<undefined> => {
    return undefined
  }

  /* eslint-disable-next-line @typescript-eslint/require-await -- we are mocking routines that will! */
  shorten = async (): Promise<{ url: undefined; id: undefined }> => {
    return { url: undefined, id: undefined, }
  }

  /* eslint-disable-next-line @typescript-eslint/require-await -- we are mocking routines that will! */
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
