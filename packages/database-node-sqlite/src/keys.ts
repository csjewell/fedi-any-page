/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { subtle } from 'node:crypto'
import { type Database, DataError, Utils } from '@csjewell-activitypub/general'
import { SQLiteDatabase } from './database.ts'
import type { Keyv } from 'keyv'
import type { DatabaseSync } from 'node:sqlite'
import type * as AP from '@csjewell-activitypub/types'

type DBDatabaseKey = {
  id         : number
  actorId    : string
  publicKey  : string
  privateKey : string
  expires?   : unknown
}

export class KeysSQLiteStorage
  extends SQLiteDatabase
  implements Database.DatabaseKey {
  private actorId       : string
  private dbKeyId       : number | undefined = undefined
  private dbDatabaseKey : DBDatabaseKey | undefined = undefined

  constructor(cache: Keyv, handle: DatabaseSync, message: AP.ActorReference | string) {
    super(cache, handle)
    const actorId = Utils.entityRefToString(message as URL)

    if (actorId === undefined) {
      throw new DataError('Was not sent correct actor information')
    }

    this.actorId = actorId
  }

  getPublicKey(): string {
    if (!this.dbKeyId) {
      this.exists()
    }

    if (this.dbDatabaseKey === undefined) {
      throw new DataError(`Do not have public/private keypair in database for ${ this.actorId }`)
    }

    return this.dbDatabaseKey.publicKey
  }

  getPrivateKey(): string {
    if (!this.dbKeyId) {
      this.exists()
    }
    if (this.dbDatabaseKey === undefined) {
      throw new DataError(`Do not have public/private keypair in database for ${ this.actorId }`)
    }

    return this.dbDatabaseKey.privateKey
  }

  async createKey(): Promise<void> {
    if (this.exists()) {
      throw new DataError(`Already have public/private keypair in database for ${ this.actorId }`)
    }

    const keyPair = await subtle.generateKey('Ed25519', true, [ 'sign', 'verify' ])

    const publicKey = await subtle.exportKey('spki', (keyPair as CryptoKeyPair).publicKey).then(
      (pubKey: ArrayBuffer): string => {
        const body = btoa(String.fromCharCode(...new Uint8Array(pubKey))).match(/.{1,64}/g)!.join('\n')

        return `-----BEGIN PUBLIC KEY-----\n${ body }\n-----END PUBLIC KEY-----`
      },
    )

    const privateKey = await subtle.exportKey('pkcs8', (keyPair as CryptoKeyPair).privateKey).then(
      (priKey: ArrayBuffer): string => {
        const body = btoa(String.fromCharCode(...new Uint8Array(priKey))).match(/.{1,64}/g)!.join('\n')

        return `-----BEGIN PRIVATE KEY-----\n${ body }\n-----END PRIVATE KEY-----`
      },
    )

    const stmtInsert = this.handle.prepare(
      'INSERT INTO keys SET actor_id = ?, public_key = ?, private_key = ?, expires = NULL',
    )

    const resp = stmtInsert.run(this.actorId, publicKey, privateKey)

    this.dbKeyId = resp.lastInsertRowid as number
    this.dbDatabaseKey = {
      id      : this.dbKeyId,
      actorId : this.actorId,
      publicKey,
      privateKey,
    }
  }

  exists(): boolean {
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
    `)

    const resp = stmtKeys.all(this.actorId)

    if (resp.length > 0) {
      this.dbDatabaseKey = resp[0] as DBDatabaseKey
      this.dbKeyId = this.dbDatabaseKey.id
      return true
    }

    return false
  }

  databaseId(): number | undefined {
    return this.dbKeyId
  }
}
