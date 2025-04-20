/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { html } from 'htm/preact'
import type { FunctionComponent } from 'preact'

/**
 * Displays the information about the Markdown that can be used.
 *
 * @param isOpen - Is the Info open?
 * @returns A FunctionComponent, to be consumed by JSX or HTM.
 */
const MarkdownInfo: FunctionComponent<{ isOpen: boolean, }> = ({ isOpen, }) => {
  // This is because otherwise, I get run-on phrases.
  const infoText = [
    html`Replies are composed using a subset of markdown. The subset allowed is as follows: `,
    html`*italic* **bold** ***italic and bold***`,
  ]

  return html`
    <p class="mdinfo" style=${ { display: isOpen ? 'block' : 'none', } }>
      ${ infoText }
    </p>
  `
}

/* eslint-disable-next-line import-x/no-default-export */
export default MarkdownInfo
