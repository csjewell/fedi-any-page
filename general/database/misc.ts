/* SPDX-License-Identifier: MIT */

/*
 */
export type DBUsername = {
  username: string | undefined
  usernameId: number | undefined
}

/*
 */
export interface DatabaseKey {
  createKey(): Promise<void>
}
