/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */

/**
 * The information about a particular local user that the ActivityPub toolkit
 * needs to know.
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

