/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */

/**
 *
 */
export type User = {
  fullname  : string
  homepage? : string
  summary?  : string
  username? : string
  aliases?  : Array<string>
  // At Protocol.
  dId?      : string
}

