/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { BaseMockUsers } from './base-mock-users.ts'
import type { Database, User } from '@csjewell-activitypub/general'

export class AnyUsers extends BaseMockUsers implements Database.UsersStorage {
  /* eslint-disable-next-line @typescript-eslint/require-await -- we are mocking routines that will! */
  exists = async (): Promise<boolean> => {
    return this.username.length >= 6
  }

  /* eslint-disable-next-line @typescript-eslint/require-await -- we are mocking routines that will! */
  retrieve = async (): Promise<User> => {
    return { fullname: this.username, username: this.username, }
  }

  checkPassword = async (pw: string): Promise<boolean> => {
    if (!await this.exists()) {
      return false
    }

    // Not worrying about emoji usernames, etc,
    /* eslint-disable-next-line @typescript-eslint/no-misused-spread */
    return pw === [...this.username].reverse().join('')
  }
}
