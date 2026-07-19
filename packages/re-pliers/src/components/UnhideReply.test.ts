/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { html } from 'htm/preact'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render } from '@testing-library/preact'
import { complicatedReplies, noReplies, wrapper } from '../test-helper.ts'
import UnhideReply from './UnhideReply.ts'

describe('that UnhideReply component', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders a button to unhide a reply', async (): Promise<void> => {
    const unhide = vi.fn(() => { return })
    const rep = complicatedReplies()

    rep.replies[1].isHidden = true

    const { getByTitle, queryByTitle, } = render(
      wrapper(html`<${ UnhideReply } index=1 unhide=${ unhide }/>`, true, rep),
    )

    expect(queryByTitle('Unhide reply')).toBeDefined()
    expect(queryByTitle('Cannot unhide this reply just yet...')).toBeNull()
    expect(unhide).not.toHaveBeenCalled()
    await act(() => {
      fireEvent.click(getByTitle('Unhide reply'))
    })
    expect(unhide).toHaveBeenCalled()
    expect(rep.replies[1].isHidden).toBeFalsy()
  })

  it('does not render a button if there are no replies', () => {
    const unhide = vi.fn(() => { return })

    const { queryByTitle, } = render(
      wrapper(html`<${ UnhideReply } index=1 unhide=${ unhide }/>`, true, noReplies()),
    )

    expect(queryByTitle('Unhide reply')).toBeNull()
    expect(queryByTitle('Cannot unhide this reply just yet...')).toBeDefined()
  })
})
