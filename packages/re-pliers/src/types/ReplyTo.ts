/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import * as v from '@valibot/valibot'

export const ReplyToSchema = v.strictObject({
  username  : v.string(),
  actorLink : v.string(),
})

export type ReplyTo = v.InferOutput<typeof ReplyToSchema>
