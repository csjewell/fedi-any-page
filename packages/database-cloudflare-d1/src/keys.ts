/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import crypto from 'node:crypto'
import { type Database, DataError, Utils } from '@csjewell-activitypub/general'
import { CloudflareD1Database } from './router.ts'
import type { Keyv } from 'keyv'
import type * as AP from '@csjewell-activitypub/types'
import type { CloudflareConfig } from './config.ts'

type DBDatabaseKey = {
  id         : number
  actorId    : string
  publicKey  : string
  privateKey : string
  expires?   : unknown
}

export class KeysCFStorage extends CloudflareD1Database implements Database.DatabaseKey {
  private actorId       : string
  private dbKeyId       : number | undefined = undefined
  private dbDatabaseKey : DBDatabaseKey | undefined = undefined

  constructor(cache: Keyv, env: CloudflareConfig, message: AP.ActorReference | string) {
    super(cache, env)
    const actorId = Utils.entityRefToString(message as URL)

    if (actorId === undefined) {
      throw new DataError('Was not sent correct actor information')
    }

    this.actorId = actorId
  }

  async getPublicKey(): Promise<string> {
    if (!this.dbKeyId) {
      await this.exists()
    }
    if (this.dbDatabaseKey === undefined) {
      throw new DataError(`Do not have public/private keypair in database for ${ this.actorId }`)
    }

    return this.dbDatabaseKey.publicKey
  }

  async getPrivateKey(): Promise<string> {
    if (!this.dbKeyId) {
      await this.exists()
    }
    if (this.dbDatabaseKey === undefined) {
      throw new DataError(`Do not have public/private keypair in database for ${ this.actorId }`)
    }

    return this.dbDatabaseKey.privateKey
  }

  async createKey(): Promise<void> {
    if (await this.exists()) {
      throw new DataError(`Already have public/private keypair in database for ${ this.actorId }`)
    }

    const keyPair = await crypto.subtle.generateKey('Ed25519', true, [ 'sign', 'verify' ])

    const publicKey = await crypto.subtle.exportKey('spki', (keyPair as CryptoKeyPair).publicKey).then(
      (pubKey: ArrayBuffer): string => {
        const body = btoa(String.fromCharCode(...new Uint8Array(pubKey))).match(/.{1,64}/g)!.join('\n')

        return `-----BEGIN PUBLIC KEY-----\n${ body }\n-----END PUBLIC KEY-----`
      },
    )

    const privateKey = await crypto.subtle.exportKey('pkcs8', (keyPair as CryptoKeyPair).privateKey).then(
      (priKey: ArrayBuffer): string => {
        const body = btoa(String.fromCharCode(...new Uint8Array(priKey))).match(/.{1,64}/g)!.join('\n')

        return `-----BEGIN PRIVATE KEY-----\n${ body }\n-----END PRIVATE KEY-----`
      },
    )

    const stmtInsert = this.handle.prepare(
      'INSERT INTO keys SET actor_id = ?, public_key = ?, private_key = ?, expires = NULL',
    ).bind(this.actorId, publicKey, privateKey)

    const resp = await stmtInsert.run()

    this.dbKeyId = resp.meta.last_row_id
    this.dbDatabaseKey = {
      id      : resp.meta.last_row_id,
      actorId : this.actorId,
      publicKey,
      privateKey,
    }
  }

  async exists(): Promise<boolean> {
    if (this.dbDatabaseKey !== undefined) {
      return true
    }

    const stmtKeys = this.handle.prepare(`
      SELECT id,
             actor_id AS id,
             public_key AS publicKey,
             private_key AS privateKey,
             expires
        FROM keys
       WHERE actor_id = ?
    `).bind(this.actorId)

    const resp = await stmtKeys.run()

    if (resp.results.length > 0) {
      this.dbDatabaseKey = resp.results[0] as DBDatabaseKey
      this.dbKeyId = resp.meta.last_row_id
      return true
    }

    return false
  }

  databaseId(): number | undefined {
    return this.dbKeyId
  }
}
