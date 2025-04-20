/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import * as v from 'valibot'
import { AuthRespSchema } from './AuthResp.ts'
import { ErrorRespSchema } from './ErrorResp.ts'

export const MaybeAuthRespSchema = v.variant('success', [ AuthRespSchema, ErrorRespSchema ])

type MaybeAuthResp = v.InferOutput<typeof MaybeAuthRespSchema>

/* eslint-disable-next-line import-x/no-default-export */
export default MaybeAuthResp
