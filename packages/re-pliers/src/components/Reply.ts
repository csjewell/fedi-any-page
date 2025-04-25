/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
/* eslint 'import-x/max-dependencies' : ['warn', { max: 15, ignoreTypeImports : true, }], */
import { html } from 'htm/preact'
import { useContext, useReducer, useState } from 'preact/hooks'
import Markup from 'preact-markup'
import EnterOutlined from '@ant-design/icons-svg/es/asn/EnterOutlined'
import LikeTwoTone from '@ant-design/icons-svg/es/asn/LikeTwoTone'
import AuthCtx from '../context/AuthCtx.ts'
import ReplyListCtx from '../context/ReplyListCtx.ts'
import CreateReply from './CreateReply.ts'
import HideReply from './HideReply.ts'
import Icon from './Icon.ts'
import LikeButton from './LikeButton.ts'
import ReplyExpander from './ReplyExpander.ts'
import UnhideReply from './UnhideReply.ts'
import type { FunctionComponent } from 'preact'
import type { AuthInfo } from '../types/AuthInfo.ts'
import type { ReplyList } from '../types/ReplyList.ts'

/**
 * Displays a reply and its descendants.
 *
 * @param isOpen - Is the modal open?
 * @defaultValue true
 * @param index - The index of the reply to submit.
 * @param indentLevel - How far should the reply be indented.
 * @param needsBottom - Should I display the bottom <hr> or not?
 * @returns A FunctionComponent, to be consumed by JSX or HTM.
 */
const Reply: FunctionComponent<{
  isOpen?     : boolean,
  index       : number,
  indentLevel : number,
  needsBottom : boolean,
}> = ({
  isOpen = true,
  index,
  indentLevel,
  needsBottom,
}) => {
  const replyList = useContext<ReplyList>(ReplyListCtx)
  const auth = useContext<AuthInfo>(AuthCtx)
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  const [ , forceUpdate ] = useReducer<number, void>(x => x + 1, 0)

  let i = 1

  const reply = replyList.replies.at(index)

  if (reply === undefined) {
    setTimeout(() => {
      i += 1
      forceUpdate()
    }, Math.round(1000 * Math.sqrt(i)))
    return html`
      <p>This reply is not available yet.</p>
      ${ needsBottom && html`<hr />` }
    `
  }

  const [ isNotHidden, setIsNotHidden ] = useState<boolean>(!reply.isHidden)
  const [ isReplyOpen, setIsReplyOpen ] = useState<boolean>(false)

  const dateTrue = (): string => {
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

    return fmt.format(reply.date)
  }

  if (!isOpen) {
    return html``
  }

  if (auth.actor === '' || !auth.isVerified) {
    if (reply.isPrivate) {
      return html`
        <p>You must be logged in to see this reply.</p>
        ${ needsBottom && html`<hr />` }
      `
    }

    if (reply.isHidden) {
      return html`
        <p>This reply has been hidden (spam, etc.) Only logged-in users can unhide it.</p>
        ${ needsBottom && html`<hr />` }
      `
    }

    return html`
      <p>
        <a href=${ reply.replyTo.actorLink }>${ reply.replyTo.username }</a> on ${ dateTrue } said:
      </p>
      <div class="reply-box">${ reply.content }</div>
      <${ ReplyExpander } replyIndex=${ reply.replyIndex ?? [] } indentLevel=${ indentLevel + 1 } />
      ${ reply.numLikes }<${ Icon } icon=${ LikeTwoTone } />
      ${ needsBottom && html`<hr />` }
    `
  }

  if (reply.isHidden && !isNotHidden) {
    return html`
      <p>
        This reply has been hidden (spam, etc.) You can unhide it.
        <${ UnhideReply }
          index=${ index }
          unhide=${ () => { setIsNotHidden(true) } }
        />
      </p>
      ${ needsBottom && html`<hr />` }
    `
  }

  return html`
    <p>
      <a href=${ reply.replyTo.actorLink }>
        ${ reply.replyTo.username }
      </a> on ${ dateTrue } said:<br />
      <span class="reply-box">
        <${ Markup } markup=${ reply.content } type="html" />
      </span>
    </p>
    <span class="reply-buttons">
      <${ LikeButton } index=${ index } />
      <${ HideReply }
        index=${ index }
        hide=${ () => { setIsNotHidden(false) } }
      />
      <span
        class="clickable"
        onClick=${ () => { setIsReplyOpen(true) } }
        title="Reply to this reply"
        role="button"
        aria-label="Reply"
      >
        <${ Icon } icon=${ EnterOutlined } />
      </span>
      <${ ReplyExpander }
        replyIndex=${ reply.replyIndex ?? [] }
        indentLevel=${ indentLevel + 1 }
      />
    </span>
    <${ CreateReply }
      hidden=${ !isReplyOpen }
      identifier=${ reply.identifier }
      isPrivateOnly=${ reply.isPrivate ?? false }
      closeReply=${ () => { setIsReplyOpen(false) } }
    />
    ${ needsBottom && html`<hr />` }
  `
}

/* eslint-disable-next-line import-x/no-default-export */
export default Reply
