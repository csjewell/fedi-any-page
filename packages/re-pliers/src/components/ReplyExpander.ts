/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { html } from 'htm/preact'
import { useState } from 'preact/hooks'
import CompressOutlined from '@ant-design/icons-svg/es/asn/CompressOutlined'
import ExpandOutlined from '@ant-design/icons-svg/es/asn/ExpandOutlined'
import Icon from './Icon.ts'
import Reply from './Reply.ts'
import type { FunctionComponent } from 'preact'
import type { Server } from '@csjewell-activitypub/general'

/**
 * Displays the descendants of a reply.
 *
 * @param replyIndex - The replies to display.
 * @param indentLevel - How far should the replies be indented.
 * @returns A FunctionComponent, to be consumed by JSX or HTM.
 */
const ReplyExpander: FunctionComponent<{ replyIndex: Array<Server.RePliers.IndexEntry>, indentLevel: number }> = ({
  replyIndex,
  indentLevel,
}) => {
  const [ isOpen, setIsOpen ] = useState<boolean>(false)

  if (replyIndex.length === 0) {
    return html``
  }

  const lastIndex = replyIndex[replyIndex.length - 1].index

  return html`
    <span
      class="clickable"
      onClick=${ () => { setIsOpen(!isOpen) } }
      title=${ isOpen ? 'Collapse Replies' : 'Expand Replies' }
      role="button"
      aria-label=${ isOpen ? 'Collapse Replies' : 'Expand Replies' }
    >
      ${ isOpen
        ? html`<${ Icon } icon=${ CompressOutlined } /> Collapse `
        : html`<${ Icon } icon=${ ExpandOutlined } /> Expand ` }
      ${ replyIndex.length > 1 ? html`${ replyIndex.length } replies` : html`1 reply` }
    </span>
    ${ isOpen && html`<hr />` }
    ${
      replyIndex.map(
        (i) => {
          return html`
            <${ Reply }
              key=${ i.identifier }
              index=${ i.index }
              isOpen=${ isOpen }
              indentLevel=${ indentLevel }
              needsBottom=${ i.index !== lastIndex }
            />
          `
        },
      )
    }
  `
}

/* eslint-disable-next-line import-x/no-default-export */
export default ReplyExpander
