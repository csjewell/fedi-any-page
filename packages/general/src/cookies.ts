/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */

import * as v from '@valibot/valibot'

/**
 * The schema for what the cookies should look like
 *
 * @property actinf - the currently logged in username
 * @property actinfo - the key to the session cache
 */
export const CookiesSchema = v.strictObject({
  actinf  : v.optional(v.string()),
  actinfo : v.optional(v.string()),
})

/**
 * The stored cookies
 *
 * @property actinf - the currently logged in username
 * @property actinfo - the key to the session cache
 */
export type Cookies = v.InferOutput<typeof CookiesSchema>

/**
 * The schema for what is stored in a cookie/memory-only-session
 *
 * @property key - the key to the session cache = @link{cookies.actinfo}
 */
export const SessionDataSchema = v.strictObject({
  key : v.string(),
})

export type SessionData = v.InferOutput<typeof SessionDataSchema>

