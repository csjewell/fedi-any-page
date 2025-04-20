/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { html } from 'htm/preact'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/preact'
import { complicatedReplies, noReplies, wrapper } from '../test-helper.ts'
import ReplyExpander from './ReplyExpander.ts'

const testReplies = complicatedReplies()
const index = testReplies.replies[0].replyIndex

describe('the ReplyExpander component', () => {
  afterEach(() => { cleanup() })

  it('renders replies when index is available', () => {
    const { getByTitle, queryByText, } = render(
      wrapper(html`<${ ReplyExpander } replyIndex=${ index } />`, true, testReplies),
    )

    expect(queryByText('first reply to the first reply', { exact: false, })).toBeNull()
    fireEvent.click(getByTitle('Expand Replies'))
    expect(queryByText('first reply to the first reply', { exact: false, })).toBeDefined()
    fireEvent.click(getByTitle('Collapse Replies'))
    expect(queryByText('first reply to the first reply', { exact: false, })).toBeNull()
  })

  it('renders no replies when index is empty', () => {
    const { queryByText, } = render(
      wrapper(html`<${ ReplyExpander } replyIndex=${ [] } />`, true, noReplies()),
    )

    expect(queryByText('said:', { exact: false, })).toBeNull()
  })
})
