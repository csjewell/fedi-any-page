/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import * as v from '@valibot/valibot'

export const AuthInfoSchema = v.strictObject({
  actor      : v.string(),
  isVerified : v.boolean(),
})

export type AuthInfo = v.InferOutput<typeof AuthInfoSchema>

// export const isLoggedOut: AuthInfo = { actor: '', isVerified: false }
