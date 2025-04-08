/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */

import { BaseUsersStorage, } from '../database/users.ts'

export default class BaseMockUsers extends BaseUsersStorage {
  databaseId = (): undefined => {
    return undefined
  }

  document = (): undefined => {
    return undefined
  }

  /* eslint-disable-next-line @typescript-eslint/require-await -- we are mocking routines that will! */
  shorten = async (): Promise<{ url: undefined; id: undefined }> => {
    return { url: undefined, id: undefined, }
  }

  /* eslint-disable-next-line @typescript-eslint/require-await -- we are mocking routines that will! */
  remove = async (): Promise<boolean> => {
    return true
  }

  /* eslint-disable-next-line @typescript-eslint/require-await -- we are mocking routines that will! */
  save = async (): Promise<boolean> => {
    return true
  }
}
