/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */

import type { User } from '../users.ts'

export type UsersDB = {
  checkPassword : (password: string) => Promise<boolean>
  retrieveUser  : () => User | undefined
}
