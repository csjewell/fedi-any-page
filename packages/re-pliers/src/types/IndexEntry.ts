/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import * as v from '@valibot/valibot'

export const IndexEntrySchema = v.strictObject({
  index      : v.number(),
  identifier : v.pipe(v.string(), v.url()),
})

type IndexEntry = v.InferOutput<typeof IndexEntrySchema>

/* eslint-disable-next-line import-x/no-default-export */
export default IndexEntry
