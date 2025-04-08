/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import type { StorageHandler } from '../database/router.ts'
import { type UsersStorage,  } from '../database/users.ts'
import { type User } from '../users.ts'
import BaseMockUsers from './base-mock-users.ts'

export default class AnyUsers extends BaseMockUsers implements StorageHandler<User>, UsersStorage {
  private isExisting = false

  constructor(isExisting = true) {
    super()
    this.isExisting = isExisting
  }

  /* eslint-disable-next-line @typescript-eslint/require-await -- we are mocking routines that will! */
  exists = async (): Promise<boolean> => {
    return this.isExisting
  }

  /* eslint-disable-next-line @typescript-eslint/require-await -- we are mocking routines that will! */
  retrieve = async (): Promise<User> => {
    return { fullname: this.username, username: this.username, }
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
}
