/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */

export type AuthCookies = {
  actinfo : undefined | string,
  actinf  : undefined | {
    actor   : string,
    expires : number,
  },
}
