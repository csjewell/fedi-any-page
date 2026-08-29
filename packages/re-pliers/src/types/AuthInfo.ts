/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import * as v from '@valibot/valibot'

export const AuthInfoSchema = v.strictObject({
  actor        : v.string(),
  whenVerified : v.number(),
})

export type AuthInfo = v.InferOutput<typeof AuthInfoSchema>

// export const isLoggedOut: AuthInfo = { actor: '', isVerified: false }

export const validateAuthInfo = (value: unknown): value is AuthInfo => {
  return v.is<typeof AuthInfoSchema>(AuthInfoSchema, value)
}
