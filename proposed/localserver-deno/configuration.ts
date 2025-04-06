/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { NotImplementedError } from '../general/errors.ts'
import { db } from './database.ts'
import type { DatabaseSync } from 'node:sqlite'
import type { Configuration } from '../general/configuration.ts'
import type * as AP from '../types/mod.ts'

class TestConfig implements Configuration<DatabaseSync, void, unknown> {
  public readonly url = new URL('http://test-deno.localhost/')
  public readonly privateKey = 'locked'
  public readonly debugDB  = false
  public readonly siteName  = 'Test Site'
  public readonly database = db

  localGet(_url: string | URL): AP.CoreObject | undefined {
    throw new NotImplementedError()
  }

  getActorURL(_username: string): string {
    throw new NotImplementedError()
  }

  getActorBasedId(_username: string, _ending: string): string {
    throw new NotImplementedError()
  }
}

export const Config = new TestConfig()
