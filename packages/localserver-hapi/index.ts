#!/usr/bin/env node
/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { HAPIServer } from './src/server.ts'

await new HAPIServer('', true).start()
