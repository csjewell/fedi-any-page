#!/usr/bin/env node
/*! SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { H3Server } from './src/server.ts'

// listhen expects 'app' to be exported.
/* eslint-disable-next-line @typescript-eslint/naming-convention */
export const app = new H3Server('./h3.server.db', true).getApp()
