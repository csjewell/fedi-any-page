/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import * as v from '@valibot/valibot'
import { AuthRespSchema } from './AuthResp.ts'
import { ErrorRespSchema } from './ErrorResp.ts'

export const MaybeAuthRespSchema = v.variant('success', [ AuthRespSchema, ErrorRespSchema ])

export type MaybeAuthResp = v.InferOutput<typeof MaybeAuthRespSchema>
