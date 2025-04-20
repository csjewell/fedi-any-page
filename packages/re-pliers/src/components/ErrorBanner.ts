/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { html } from 'htm/preact'
import { useErrorBoundary } from 'preact/hooks'
import ExclamationCircleOutlined from '@ant-design/icons-svg/es/asn/ExclamationCircleOutlined'
import Icon from './Icon.ts'
import type { FunctionComponent } from 'preact'

/**
 * The component that displays errors.
 *
 * @returns A FunctionComponent, to be consumed by JSX or HTM.
 */
const ErrorBanner: FunctionComponent = ({ children, }) => {
  const [ error, resetError ] = useErrorBoundary()

  return html`
    ${ error !== undefined && (error as Error).message !== '' && html`
      <span
        style=${ { 'color': 'rebeccapurple', 'background-color': 'red', } }
        role="button"
        aria-label="Error"
        onClick=${ resetError }
      >
        <${ Icon } icon=${ ExclamationCircleOutlined } /> Error: ${ (error as Error).message }
      </span>
    ` }
    ${ children }
  `
}

/* eslint-disable-next-line import-x/no-default-export */
export default ErrorBanner
