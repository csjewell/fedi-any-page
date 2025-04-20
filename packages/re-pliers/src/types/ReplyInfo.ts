/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import * as v from 'valibot'
import { IndexEntrySchema } from './IndexEntry.ts'
import { ReplyToSchema } from './ReplyTo.ts'

/**
 * One reply, the information about it, and links to replies to it.
 *
 * Contents:
 *
 * `identifier`: The ActivityPub id of the reply.
 *
 * `replyTo`: A representation of the actor to reply to.
 *
 * `date`: The date the reply was published by the creator.
 *
 * `content`: The reply content. Contains a limited subset of HTML.
 * Mastodon uses the subset defined at
 * {@link https://docs.joinmastodon.org/spec/activitypub/#sanitization},
 * and so do we.
 *
 * `numLikes`: The number of Likes that this reply has received.
 *
 * `liked`: Does the logged-in user like this reply?
 *
 * `isPrivate`: Is this reply private to the logged-in user?
 *
 * `isHidden`: Has this reply been hidden?
 *
 * `replyIndex`: An index to the replies of this reply. Is an array of {@link IndexEntry}.
 *
 * While `content` should be sanitized by ActivityPub producers,
 * we sanitize it again as it is stored, so this is safe to display as is.
 *
 * @beta
 */

export const ReplyInfoSchema = v.strictObject({
  identifier : v.pipe(v.string(), v.url()),
  replyTo    : ReplyToSchema,
  date       : v.pipe(
    v.union([ v.pipe(v.string(), v.isoTimestamp()), v.date() ]),
    v.transform(input => typeof input === 'string' ? new Date(input) : input),
  ),
  content    : v.string(),
  numLikes   : v.pipe(v.number(), v.integer(), v.gtValue(-1)),
  liked      : v.optional(v.boolean()),
  isPrivate  : v.optional(v.boolean()),
  isHidden   : v.optional(v.boolean()),
  replyIndex : v.optional(v.array(IndexEntrySchema)),
})

type ReplyInfo = v.InferOutput<typeof ReplyInfoSchema>

export const validateReplyInfo = (value: unknown): value is ReplyInfo => {
  return v.is<typeof ReplyInfoSchema>(ReplyInfoSchema, value)
}

type AssertIsReplyInfo = (value: unknown) => asserts value is ReplyInfo
export const assertReplyInfo: AssertIsReplyInfo = (value) => {
  v.assert<typeof ReplyInfoSchema>(ReplyInfoSchema, value)
}

/* eslint-disable-next-line import-x/no-default-export */
export default ReplyInfo
