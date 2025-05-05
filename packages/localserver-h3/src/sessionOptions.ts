/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */

import type { SessionConfig } from 'h3'

export const sessionOptions = (isTest: boolean): SessionConfig => {
  return {
    name     : 'actinfo',
    password : 'I saw the sign. Life is demanding, without understanding...',
    cookie   : {
      httpOnly : true,
      secure   : isTest,
      sameSite : 'strict',
    },
    // 4 hours
    maxAge : 60 * 60 * 4,
  }
}
