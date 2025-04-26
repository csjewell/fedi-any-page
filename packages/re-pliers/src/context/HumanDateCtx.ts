/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { HumanizeDuration, HumanizeDurationLanguage } from 'humanize-duration-ts'
import { type Context, createContext } from 'preact'

export type HumanDateCtxType = (d: Date) => string

const humanizer = new HumanizeDuration(new HumanizeDurationLanguage())

humanizer.setOptions({
  largest     : 2,
  round       : true,
  conjunction : ' and ',
  serialComma : false,
})

/** Stores the current date conversion function. */
export const HumanDateCtx: Context<HumanDateCtxType> = createContext<HumanDateCtxType>((d) => {
  return humanizer.humanize(Date.now().valueOf() - d.valueOf())
})

