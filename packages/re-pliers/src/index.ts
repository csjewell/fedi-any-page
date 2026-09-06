/*! SPDX-License-Identifier: MIT
 *  SPDX-FileCopyrightText: 2025, 2026 Curtis Jewell and other contributors
 */
import register from 'preact-custom-element'
import App from './components/App.ts'

register(App, 're-pliers', [ 'domain', 'page', 'user', 'cache' ], { shadow: true, })

// This is only to get typedoc to scan into here.
export const one = 1
