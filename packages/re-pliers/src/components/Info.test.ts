/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { html } from 'htm/preact'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/preact'
import Info from './Info.ts'

describe('the Info component visibly', () => {
  afterEach(() => { cleanup() })

  it('renders the username given', () => {
    const { getByText, } = render(html`<${ Info } user=test domain=ap.example.org isOpen=${ true } />`)

    expect(getByText('@test@ap.example.org', { exact: false, })).toBeDefined()
  })

  it('finds the Mastodon link', () => {
    const { getByText, } = render(html`<${ Info } user=test domain=ap.example.org isOpen=${ true } />`)

    expect(getByText('Mastodon', { exact: false, })).toBeDefined()
  })
})

describe('the Info component invisibly', () => {
  afterEach(() => { cleanup() })

  it('renders the username given', () => {
    const { getByText, } = render(html`<${ Info } user=test domain=ap.example.org isOpen=${ false } />`)

    expect(getByText('@test@ap.example.org', { exact: false, })).toBeDefined()
  })
})
