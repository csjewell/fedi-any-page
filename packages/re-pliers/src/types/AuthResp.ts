/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import * as v from '@valibot/valibot'

export const AuthRespSchema = v.strictObject({
  actor   : v.pipe(v.string(), v.url()),
  success : v.literal(true),
})

export type AuthResp = v.InferOutput<typeof AuthRespSchema>

export const validateAuthResp = (value: unknown): value is AuthResp => {
  return v.is<typeof AuthRespSchema>(AuthRespSchema, value)
}

type AssertIsAuthResp = (value: unknown) => asserts value is AuthResp
export const assertAuthResp: AssertIsAuthResp = (value: unknown) => {
  v.assert<typeof AuthRespSchema>(AuthRespSchema, value)
}
