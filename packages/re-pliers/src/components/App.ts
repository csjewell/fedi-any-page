/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { html } from 'htm/preact'
import { type ReplyListCtxType, unfilledCache } from '../types/ReplyListCtxType.ts'
import Auth from './Auth.ts'
import ErrorBanner from './ErrorBanner.ts'
import Header from './Header.ts'
import Replies from './Replies.ts'
import TopLevelReplies from './TopLevelReplies.ts'
import type { FunctionComponent } from 'preact'

/**
 * The top-level component of the re-pliers widget.
 *
 * @param page - The canonical URL of the current page. This URL is used as the
 * ActivityPub identifier of the page.
 * @param user - The user who created the page.
 * @param domain - The domain of the ActivityPub endpoint the user is on.
 * @returns A functional Component to use in JSX or HTM.
 */
const App: FunctionComponent<{
  page   : string,
  user   : string,
  domain : string,
  cache? : ReplyListCtxType,
}> = ({ page, user, domain, cache, }) => {
  return html`
    <${ Header } user=${ user } domain=${ domain }>
      <${ ErrorBanner }>
        <${ Auth } page=${ page }>
          <${ Replies } page=${ page } cache=${ cache ?? unfilledCache }>
            <${ TopLevelReplies } />
          <//>
        <//>
      <//>
    <//>
  `
}

/* eslint-disable-next-line import-x/no-default-export */
export default App
