#!/usr/bin/env node
/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { cwd } from 'node:process'
import { HAPIServer } from './src/server.ts'

await new HAPIServer(`${ cwd()  }/ap.sqlite.db`, true).start()
