/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */

import { Database } from '@csjewell-activitypub/general'

export class BaseMockUsers extends Database.BaseUsersStorage {
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
