/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import * as v from 'valibot'

export const ReplyToSchema = v.strictObject({
  username  : v.string(),
  actorLink : v.string(),
})

type ReplyTo = v.InferOutput<typeof ReplyToSchema>

/* eslint-disable-next-line import-x/no-default-export */
export default ReplyTo
