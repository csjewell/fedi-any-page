/*! SPDX-License-Identifier: MIT
 *  SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { html } from 'htm/preact'
// eslint-disable-next-line import-x/no-deprecated -- Not using the deprecated functionality
import { render } from 'preact'
import { Server } from '@csjewell-activitypub/general'
import AppTest from './components/AppTest.ts'
import complicatedReplyJSON from './replytesting.json'

Server.RePliers.assertReplyListResp(complicatedReplyJSON)
const replyListCtx = Server.RePliers.toReplyListCtxType(complicatedReplyJSON)

// eslint-disable-next-line import-x/no-deprecated -- Not using the deprecated functionality
render(
  html`<${ AppTest } user="csjewell" domain="curtisjewell.dev" testData=${ replyListCtx } />`,
  document.querySelector('#pliers') as HTMLElement,
)
