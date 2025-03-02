/* SPDX-License-Identifier: MIT */
import crypto from 'crypto'
import * as Kit from '@csjewell-activitypub/general'
import type * as AP from '@csjewell-activitypub/types'
import { CloudflareD1Database } from './router.ts'

type DBDatabaseKey = {
  id: number
  actorId: string
  publicKey: string
  privateKey: string
  expires?: unknown
}

export class KeysCFStorage extends CloudflareD1Database implements Kit.DatabaseKey {
  private actorId: string
  private dbKeyId: number | undefined = undefined
  private dbDatabaseKey: DBDatabaseKey | undefined = undefined

  constructor(env: Kit.Configuration, message: AP.ActorReference | string) {
    super(env)
    const actorId = Kit.entityRefToString(message as URL)

    if (actorId === undefined) {
      throw new Kit.DataError('Was not sent correct actor information')
    }

    this.actorId = actorId
  }

  async getPublicKey(): Promise<string> {
    if (!this.dbKeyId) {
      await this.exists()
    }
    if (this.dbDatabaseKey === undefined) {
      throw new Kit.DataError(`Do not have public/private keypair in database for ${this.actorId}`)
    }
    return this.dbDatabaseKey.publicKey
  }

  async getPrivateKey(): Promise<string> {
    if (!this.dbKeyId) {
      await this.exists()
    }
    if (this.dbDatabaseKey === undefined) {
      throw new Kit.DataError(`Do not have public/private keypair in database for ${this.actorId}`)
    }
    return this.dbDatabaseKey.privateKey
  }

  async createKey(): Promise<void> {
    if (await this.exists()) {
      throw new Kit.DataError(`Already have public/private keypair in database for ${this.actorId}`)
    }

    const EXPORTABLE = true
    const keyPair = await crypto.subtle.generateKey('Ed25519', EXPORTABLE, ['sign', 'verify'])

    const publicKey = await crypto.subtle.exportKey('spki', (keyPair as CryptoKeyPair).publicKey).then(
      function (publicKey: ArrayBuffer): string {
        const body = btoa(String.fromCharCode(...new Uint8Array(publicKey))).match(/.{1,64}/g)!.join('\n')
        return `-----BEGIN PUBLIC KEY-----\n${body}\n-----END PUBLIC KEY-----`
      },
    )

    const privateKey = await crypto.subtle.exportKey('pkcs8', (keyPair as CryptoKeyPair).privateKey).then(
      function (privateKey: ArrayBuffer): string {
        const body = btoa(String.fromCharCode(...new Uint8Array(privateKey))).match(/.{1,64}/g)!.join('\n')
        return `-----BEGIN PRIVATE KEY-----\n${body}\n-----END PRIVATE KEY-----`
      },
    )

    const stmtInsert = this.handle.prepare(
      'INSERT INTO keys SET actor_id = ?, public_key = ?, private_key = ?, expires = NULL',
    ).bind(this.actorId, publicKey, privateKey)

    const resp = await stmtInsert.run()
    if (resp.success) {
      this.dbKeyId = resp.meta.last_row_id
      this.dbDatabaseKey = {
        id: resp.meta.last_row_id,
        actorId: this.actorId,
        publicKey,
        privateKey,
      }
    } else {
      throw new Error('Failed saving keys to database')
    }
    return
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
    if (resp.success && resp.results.length > 0) {
      this.dbDatabaseKey = resp.results[0] as DBDatabaseKey
      this.dbKeyId = resp.meta.last_row_id
      return true
    } else {
      return false
    }
  }

  databaseId(): number | undefined {
    return this.dbKeyId
  }
}
