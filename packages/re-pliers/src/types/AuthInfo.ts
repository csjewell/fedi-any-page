/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import * as v from 'valibot'

export const AuthInfoSchema = v.strictObject({
  actor      : v.string(),
  isVerified : v.boolean(),
})

type AuthInfo = v.InferOutput<typeof AuthInfoSchema>

// export const isLoggedOut: AuthInfo = { actor: '', isVerified: false }

/* eslint-disable-next-line import-x/no-default-export */
export default AuthInfo
