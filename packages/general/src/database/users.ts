/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */

import type { User } from '../users.ts'

/** Additional methods the storage for users needs to implement. */
export type UsersStorage = {
  /** Checks the user's password to see if it is valid. */
  checkPassword : (password: string) => Promise<boolean>
  // Implemented in terms of StorageHandler.exists and StorageHandler.document()
  /** Retrieves the user information, if it exists. */
  retrieveUser  : () => Promise<User | undefined>
}

/** Class to extend  */
export class BaseUsersStorage {
  protected username = ''

  // Only implemented because BaseUser needs versions of these for retrieveUser to hook to.
  exists = async (): Promise<boolean> => false
  retrieve = async (): Promise<User> => { return { fullname: ''} }

  retrieveUser = async (): Promise<User | undefined> => {
    if (await this.exists()) {
      return undefined
    }

    const username = this.username
    const user = await this.retrieve()
    return { username, ...user }
  }
}
