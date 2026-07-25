/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2026 Curtis Jewell and other contributors
 */
import { execSync } from 'node:child_process'

export const getFilesList = (exclusions: Array<string>) : Array<string> => {
  return execSync('git status -z || true')
    .toString()
    .split('\0')
    .map(line => line.trim().split('\s+').at(1))
    .filter(file => file !== undefined)
    .filter(file => exclusions.includes(file.split('/')[-1]))
}
