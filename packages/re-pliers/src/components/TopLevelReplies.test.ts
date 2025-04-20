/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { html } from 'htm/preact'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/preact'
import { complicatedReplies, noReplies, simpleReply, wrapper } from '../test-helper.ts'
import TopLevelReplies from './TopLevelReplies.ts'

describe('that TopLevelReplies component', () => {
  afterEach(() => { cleanup() })

  it('renders a simple Reply', () => {
    const { getByText, } = render(
      wrapper(html`<${ TopLevelReplies } />`, true, simpleReply()),
    )

    expect(getByText('This is the first reply', { exact: false, })).toBeDefined()
  })

  it('renders no replies', () => {
    const { queryByText, } = render(
      wrapper(html`<${ TopLevelReplies } />`, true, noReplies()),
    )

    expect(queryByText('said:', { exact: false, })).toBeNull()
  })

  it('renders a tree of Replies', () => {
    const { queryByText, } = render(
      wrapper(html`<${ TopLevelReplies } />`, true, complicatedReplies()),
    )

    expect(queryByText('This is the second reply to the first reply', { exact: false, })).toBeDefined()
  })
})
