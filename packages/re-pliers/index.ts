/*! SPDX-License-Identifier: MIT
 *  SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { html } from 'htm/preact'
// eslint-disable-next-line import-x/no-deprecated -- Not using the deprecated functionality
import { render } from 'preact'
import App from './src/components/App.ts'

export const renderRepliersComponent = (page: string, user: string, domain: string, element: HTMLElement): void => {
  // eslint-disable-next-line import-x/no-deprecated -- Not using the deprecated functionality
  render(
    html`<${ App } page=${ page } user=${ user } domain=${ domain } />`,
    element,
  )
}
