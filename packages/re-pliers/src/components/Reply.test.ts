/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { html } from 'htm/preact'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/preact'
import { complicatedReplies, noReplies, simpleReply, wrapper } from '../test-helper.ts'
import Reply from './Reply.ts'

describe('the Reply component', {}, () => {
  afterEach(() => { cleanup() })

  it('renders a simple Reply', undefined, () => {
    const { getByText, } = render(
      wrapper(html`<${ Reply } index=0 isOpen=${ true } />`, true, simpleReply()),
    )

    expect(getByText('This is the first reply', { exact: false, })).toBeDefined()
  })

  it('renders no replies', undefined, () => {
    const { queryByText, } = render(
      wrapper(html`<${ Reply } index=0 isOpen=${ true } />`, true, noReplies()),
    )

    expect(queryByText('said:', { exact: false, })).toBeNull()
  })

  it('renders a tree of Replies', undefined, () => {
    const { queryByText, } = render(
      wrapper(html`<${ Reply } index=0 isOpen=${ true } />`, true, complicatedReplies()),
    )

    expect(queryByText('This is the second reply to the first reply', { exact: false, })).toBeDefined()
  })
})
