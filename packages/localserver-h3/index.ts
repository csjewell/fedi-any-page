#!/usr/bin/env node
/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { H3Server } from './src/server.ts'

export const app = new H3Server('./ap.server.db', true).getApp()
