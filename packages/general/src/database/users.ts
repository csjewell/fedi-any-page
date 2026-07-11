/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */

import type { User } from '../users.ts'
import type { StorageHandler } from './router.ts'

/** Additional methods the storage for users needs to implement. */
type UsersStorageMethods = {
  /** Checks the user's password to see if it is valid. */
  checkPassword : (password: string) => Promise<boolean>
  // Implemented in terms of StorageHandler.exists and StorageHandler.document()
  /** Retrieves the user information, if it exists. */
  retrieveUser  : (username: string) => Promise<User | undefined>
}

export type UsersStorage = StorageHandler<User> & UsersStorageMethods

/** Class to extend */
export class BaseUsersStorage {
  protected user : User | undefined = undefined
  protected username = ''

  // Only implemented because BaseUser needs versions of these for retrieveUser to hook to.
  /* eslint-disable-next-line @typescript-eslint/require-await -- we are overriding these with routines that will! */
  exists = async (): Promise<boolean> => this.user !== undefined
  /* eslint-disable-next-line @typescript-eslint/require-await -- we are overriding these with routines that will! */
  retrieve = async (): Promise<User> => { return { fullname: '', } }

  /**
   * Retrieves information about the current user.
   *
   * @param username - The username of the user being retrieved.
   * @returns - A {@link Promise} that either resolves to a {@link User} object
   * if there is a user by that username, or undefined otherwise.
   */
  retrieveUser = async (username: string): Promise<User | undefined> => {
    if (this.user?.username === username) {
      return this.user
    }

    this.username = username
    if (await this.exists()) {
      const user = await this.retrieve()

      this.user = { username, ...user, }
      return this.user
    }

    this.username = ''
    return undefined
  }
}
