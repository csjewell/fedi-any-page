/*! SPDX-License-Identifier: MIT
 *  SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
/* eslint 'import-x/max-dependencies' : ['warn', { max: 15, ignoreTypeImports : true, }], */
import { html } from 'htm/preact'
import { useState } from 'preact/hooks'
import { Server } from '@csjewell-activitypub/general'
import * as v from '@valibot/valibot'
import { ReplyActionsCtx } from '../context/ReplyActionsCtx.ts'
import { ReplyListCtx } from '../context/ReplyListCtx.ts'
import Auth from './Auth.ts'
import ErrorBanner from './ErrorBanner.ts'
import Header from './Header.ts'
import TopLevelReplies from './TopLevelReplies.ts'
import type { FunctionComponent } from 'preact'
import type { ReplyActions } from '../types/ReplyActions.ts'

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
  testData : Server.RePliers.ReplyListCtxType
}> = ({ user, domain, testData, }) => {
  const [ replyListCtx, setReplyListCtx ]
    = useState<Server.RePliers.ReplyListCtxType>(
      v.parse(Server.RePliers.ReplyListCtxTypeSchema, testData))

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
    actor      : 'https://localhost/actor/mockery',
    isVerified : true,
  }

  return html`
    <${ Header } user=${ user } domain=${ domain }>
        <${ ErrorBanner }>
          <${ Auth } page='http://localhost/blog' isTest=${ auth }>
            <${ ReplyListCtx.Provider } value=${ Server.RePliers.toReplyList(replyListCtx) }>
              <${ ReplyActionsCtx.Provider } value=${ replyActions }>
                <${ TopLevelReplies }/>
              <//>
            <//>
          <//>
        <//>
    <//>
  `
}

/* eslint-disable-next-line import-x/no-default-export */
export default AppTest
