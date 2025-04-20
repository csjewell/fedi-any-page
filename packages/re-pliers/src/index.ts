/*! SPDX-License-Identifier: MIT
 *  SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { html } from 'htm/preact'
// eslint-disable-next-line import-x/no-deprecated -- Not using the deprecated functionality
import { render } from 'preact'
import AppTest from './components/AppTest.ts'
import complicatedReplyJSON from './replytesting.json'
import { toReplyListCtxType } from './types/ReplyListCtxType.ts'
import { assertReplyListResp } from './types/ReplyListResp.ts'

assertReplyListResp(complicatedReplyJSON)
const replyListCtx = toReplyListCtxType(complicatedReplyJSON)

// eslint-disable-next-line import-x/no-deprecated -- Not using the deprecated functionality
render(
  html`<${ AppTest } user="csjewell" domain="curtisjewell.dev" testData=${ replyListCtx } />`,
  document.querySelector('#pliers') as HTMLElement,
)
