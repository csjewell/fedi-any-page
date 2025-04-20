/*! SPDX-License-Identifier: MIT
 *  SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { html } from 'htm/preact'
import { useState } from 'preact/hooks'
import AuthCtx from '../context/AuthCtx.ts'
import ReplyActionsCtx from '../context/ReplyActionsCtx.ts'
import ReplyListCtx from '../context/ReplyListCtx.ts'
import ErrorBanner from './ErrorBanner.ts'
import Header from './Header.ts'
import TopLevelReplies from './TopLevelReplies.ts'
import type { FunctionComponent } from 'preact'
import type ReplyActions from '../types/ReplyActions.ts'
import type ReplyListCtxType from '../types/ReplyListCtxType.ts'


/**
 * Current "top-level" component being used for development.
 *
 * @param user - The user who created the page.
 * @param domain - The domain of the ActivityPub endpoint the user is on.
 * @param testData - The test data being used for development.
 * @returns A FunctionComponent, to be consumed by JSX or HTM.
 */
const AppTest: FunctionComponent<{
  user     : string,
  domain   : string,
  testData : ReplyListCtxType
}> = ({ user, domain, testData, }) => {
  const [ replyListCtx, setReplyListCtx ] = useState<ReplyListCtxType>(testData)

  /* eslint-disable @typescript-eslint/require-await -- These are the end of the line. */
  const replyActions: ReplyActions = {
    like : async (i: number): Promise<void> => {
      replyListCtx.replies[i].liked = true
      replyListCtx.replies[i].numLikes += 1
      setReplyListCtx(replyListCtx)
    },
    unlike : async (i: number): Promise<void> => {
      replyListCtx.replies[i].liked = false
      replyListCtx.replies[i].numLikes -= 1
      setReplyListCtx(replyListCtx)
    },
    hide : async (i: number): Promise<void> => {
      replyListCtx.replies[i].isHidden = true
      setReplyListCtx(replyListCtx)
    },
    unhide : async (i: number): Promise<void> => {
      replyListCtx.replies[i].isHidden = true
      setReplyListCtx(replyListCtx)
    },
    reply : async (_fd: FormData): Promise<void> => { return },
  }
  /* eslint-enable @typescript-eslint/require-await */

  const auth = {
    actor      : 'https://mock.response.example.com/actor/mockery',
    isVerified : true,
  }

  return html`
    <${ Header } user=${ user } domain=${ domain }>
        <${ ErrorBanner }>
          <${ AuthCtx.Provider } value=${ auth }>
            <${ ReplyListCtx.Provider } value=${ replyListCtx }>
              <${ ReplyActionsCtx.Provider } value=${ replyActions }>
                <${ TopLevelReplies } />
              <//>
            <//>
          <//>
        <//>
    <//>
  `
}

/* eslint-disable-next-line import-x/no-default-export */
export default AppTest
