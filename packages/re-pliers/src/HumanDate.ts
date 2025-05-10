/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { HumanizeDuration, HumanizeDurationLanguage } from 'humanize-duration-ts'

export const HumanDate = new HumanizeDuration(new HumanizeDurationLanguage())
HumanDate.setOptions({
  largest     : 2,
  round       : true,
  conjunction : ' and ',
  serialComma : false,
})

