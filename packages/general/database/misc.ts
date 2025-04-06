/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */

/*
 */
export type DBUsername = {
  username   : string | undefined
  usernameId : number | undefined
}

/*
 */
export type DatabaseKey = {
  createKey : () => Promise<void>
}
