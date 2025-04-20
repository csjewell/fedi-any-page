/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */

type ReplyActions = {
  like   : (i: number) => Promise<void>,
  unlike : (i: number) => Promise<void>,
  hide   : (i: number) => Promise<void>,
  unhide : (i: number) => Promise<void>,
  reply  : (fd: FormData) => Promise<void>,
}

/* eslint-disable-next-line import-x/no-default-export */
export default ReplyActions
