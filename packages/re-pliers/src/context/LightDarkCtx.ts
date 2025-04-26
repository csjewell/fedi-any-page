/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { type Context, createContext } from 'preact'

/** Stores whether the current mode is "dark" or not. */
export const LightDarkCtx: Context<boolean> = createContext<boolean>(true)
