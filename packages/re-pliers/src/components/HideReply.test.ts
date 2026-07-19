/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { html } from 'htm/preact'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render } from '@testing-library/preact'
import { complicatedReplies, noReplies, wrapper } from '../test-helper.ts'
import HideReply from './HideReply.ts'

describe('that HideReply component', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders a button to hide a reply', async (): Promise<void> => {
    const hide = vi.fn(() => { return })
    const rep = complicatedReplies()

    const { getByTitle, queryByTitle, } = render(
      wrapper(html`<${ HideReply } index=1 hide=${ hide }/>`, true, rep),
    )

    expect(queryByTitle('Hide reply')).toBeDefined()
    expect(queryByTitle('Cannot unhide this reply just yet...')).toBeNull()
    expect(hide).not.toHaveBeenCalled()
    await act(() => {
      fireEvent.click(getByTitle('Hide reply'))
    })
    expect(hide).toHaveBeenCalled()
    expect(rep.replies[1].isHidden).toBeTruthy()
  })

  it('does not render a button if there are no replies', () => {
    const hide = vi.fn(() => { return })

    const { queryByTitle, } = render(
      wrapper(html`<${ HideReply } index=1 hide=${ hide }/>`, true, noReplies()),
    )

    expect(queryByTitle('Hide reply')).toBeNull()
    expect(queryByTitle('Cannot hide this reply just yet...')).toBeDefined()
  })
})
