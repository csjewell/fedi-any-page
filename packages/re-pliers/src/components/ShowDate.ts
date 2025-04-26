/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
/* eslint 'import-x/max-dependencies' : ['warn', { max: 15, ignoreTypeImports : true, }], */
import { html, useContext } from 'htm/preact'
import { HumanDateCtx, type HumanDateCtxType } from '../context/HumanDateCtx.ts'
import type { FunctionComponent } from 'preact'

/**
 * Displays a date.
 *
 * @param date - The date to display
 * @returns A FunctionComponent, to be consumed by JSX or HTM.
 */
const dateTrue = (d: Date): string => {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    weekday      : 'short',
    month        : 'short',
    day          : '2-digit',
    year         : 'numeric',
    hour         : '2-digit',
    minute       : '2-digit',
    second       : '2-digit',
    timeZoneName : 'short',
  })

  return fmt.format(d)
}

const ShowDate: FunctionComponent<{ date: Date, }> = ({ date, }) => {
  const humanDate = useContext<HumanDateCtxType>(HumanDateCtx)

  return html`said <span title="${ dateTrue(date) }">${ humanDate(date) } ago:</span>`
}

/* eslint-disable-next-line import-x/no-default-export */
export default ShowDate
