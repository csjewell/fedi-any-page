/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import * as v from '@valibot/valibot'

export const ErrorRespSchema = v.strictObject({
  success : v.literal(false),
  error   : v.string(),
})

type ErrorResp = v.InferOutput<typeof ErrorRespSchema>

export const validateErrorResp = (value: unknown): value is ErrorResp => {
  return v.is<typeof ErrorRespSchema>(ErrorRespSchema, value)
}

type AssertIsErrorResp = (value: unknown) => asserts value is ErrorResp
export const assertErrorResp: AssertIsErrorResp = (value: unknown) => {
  v.assert<typeof ErrorRespSchema>(ErrorRespSchema, value)
}

/* eslint-disable-next-line import-x/no-default-export */
export default ErrorResp
