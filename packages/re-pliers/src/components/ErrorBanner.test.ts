/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { html } from 'htm/preact'
import { useEffect } from 'preact/hooks'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/preact'
import ErrorBanner from './ErrorBanner.ts'
import type { FunctionComponent } from 'preact'

const ErrorBannerUser: FunctionComponent = () => {
  useEffect(() => {
    throw new Error('This is a test error')
  }, [])
  return html`<p>This is a test.</p>`
}

describe('the ErrorBanner component', () => {
  afterEach(() => { cleanup() })

  it('renders its children', () => {
    const { queryByText, } = render(html`<${ ErrorBanner }><${ ErrorBannerUser } /><//>`)

    expect(queryByText('This is a test.')).toBeDefined()
  })

  it('renders its error', () => {
    const { getByText, } = render(html`<${ ErrorBanner }><${ ErrorBannerUser } /><//>`)

    expect(getByText('This is a test error', { exact: false, })).toBeDefined()
  })

  it('stops rendering its error when it goes away', () => {
    const { getByText, queryByText, } = render(html`<${ ErrorBanner }><${ ErrorBannerUser } /><//>`)

    fireEvent.click(getByText('This is a test error', { exact: false,}))
    expect(queryByText('This is a test error', { exact: false, })).toBeNull()
  })
})

