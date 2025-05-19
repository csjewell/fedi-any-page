/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import * as v from '@valibot/valibot'

export const ReplyToSchema = v.strictObject({
  username   : v.pipe(v.string(), v.nonEmpty('Username is required')),
  actorLink  : v.pipe(v.string(), v.nonEmpty()),
  actorName  : v.exactOptional(v.pipe(v.string(), v.nonEmpty())),
  actorInbox : v.exactOptional(v.pipe(v.string(), v.nonEmpty(), v.url())),
})

export type ReplyTo = v.InferOutput<typeof ReplyToSchema>
