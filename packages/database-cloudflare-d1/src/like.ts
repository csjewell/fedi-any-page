/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { type Database, Json, NotImplementedError, Utils } from '@csjewell-activitypub/general'
import * as AP from '@csjewell-activitypub/types'
import { CloudflareD1Database } from './router.ts'
import type { Keyv } from 'keyv'
import type { CloudflareConfig } from './config.ts'
import type { DBCount, DBDocumentInfo, DBId } from './types.ts'

type LikeInfo = {
  actorId : string
  created : unknown
}

type ValidLike = { isValid: false } | {
  isValid : true,
  actorId : string,
  likedId : string,
}

export class LikeCFStorage extends CloudflareD1Database implements Database.StorageHandler<AP.Like> {
  private readonly message : AP.Like
  private dbLikeId         : number | undefined = undefined

  constructor(cache: Keyv, env: CloudflareConfig, message: AP.Like) {
    super(cache, env)
    this.message = message
  }

  databaseId(): number | undefined {
    return this.dbLikeId
  }

  document(): AP.Like {
    return this.message
  }

  private validateMessage = (): ValidLike => {
    const actorId = Utils.getEntityId(this.message.actor)

    if (actorId === undefined) {
      console.error('A Like cannot be anonymous.')
      return { isValid: false, }
    }

    // Resolve the thing being liked.
    // (We need the object, where we could get a ref)
    // TODO: [2025-04-19] We could optimize this, since we know this is OUR object being liked.
    const { object, } = this.getDocument(this.message.object)

    if (object === undefined) {
      return { isValid: false, }
    }

    const likedId = object.id

    if (likedId === undefined || likedId === null) {
      return { isValid: false, }
    }

    if (likedId.hostname !== this.env.url.hostname) {
      // If we aren't ourselves, we were never here.
      return { isValid: false, }
    }

    return { isValid: true, likedId: likedId.toString(), actorId, }
  }

  async count(er: AP.EntityReference): Promise<number> {
    const erURL = Utils.entityRefToURL(er)

    if (erURL === undefined) {
      return 0
    }

    if (erURL.hostname !== this.env.url.hostname) {
      // If we aren't ourselves, we were never here.
      return 0
    }

    const stmtLikes = this.handle.prepare(
      'SELECT COUNT(*) AS count FROM likes WHERE liked_id = ? AND deletable = 0',
    ).bind(erURL.toString())
    const resp = await stmtLikes.run()

    return (resp.results[0] as DBCount).count
  }

  async list(er: AP.EntityReference, getPrivate = false): Promise<Array<LikeInfo>> {
    const erURL = Utils.entityRefToURL(er)

    if (erURL === undefined) {
      return []
    }

    if (erURL.hostname !== this.env.url.hostname) {
      // If we aren't ourselves, we were never here.
      return []
    }

    const likes: Array<LikeInfo> = []
    const sqlPrivate = getPrivate ? '' : 'AND private = 0'

    const stmtLikes = this.handle.prepare(
      `SELECT actor_id, created FROM likes WHERE liked_id = ? ${ sqlPrivate } AND deletable = 0`,
    ).bind(erURL.toString())
    const resp = await stmtLikes.run()

    if (resp.results.length > 0) {
      (resp.results as Array<LikeInfo>).forEach((info) => {
        likes.push(({ ...info, } as LikeInfo))
      })
    }

    return likes
  }

  async remove(): Promise<boolean> {
    // If from Mastodon - someone un-liked the post. We need to delete it from the store.
    const messageInfo = this.validateMessage()

    if (!messageInfo.isValid) {
      return false
    }

    const { actorId, likedId, } = messageInfo

    console.info(`Attempting to delete Like ${ actorId } on ${ likedId }`)

    const stmtDel = this.handle.prepare('DELETE FROM likes WHERE liked_id = ? AND actor_id = ?').bind(likedId, actorId)
    const resp = await stmtDel.run()

    console.info(`Deleted Like of ${ actorId } on ${ likedId }`)
    console.info(resp)
    return true
  }

  async save(): Promise<boolean> {
    const messageInfo = this.validateMessage()

    if (!messageInfo.isValid) {
      return false
    }

    const { actorId, likedId, } = messageInfo

    // Shorten up what gets saved.
    this.message.object = new URL(likedId)
    this.message.actor = new URL(actorId)

    const documentObj = await this.documentEntry(this.message).shorten()

    if (documentObj.url === undefined) {
      return false
    }

    const stmtInsert = this.handle.prepare(`
      INSERT INTO likes (liked_id, actor_id, document_id)
           VALUES       (       ?,        ?,           ?)
    `).bind(likedId, actorId, documentObj.id)
    const resp = await stmtInsert.run()

    this.dbLikeId = resp.meta.last_row_id
    return true
  }

  async exists(): Promise<boolean> {
    if (this.dbLikeId) {
      return true
    }

    const messageInfo = this.validateMessage()

    if (!messageInfo.isValid) {
      return false
    }

    const { actorId, likedId, } = messageInfo

    let isOK = false
    const stmtExists = this.handle.prepare('SELECT id FROM likes WHERE liked_id = ? AND actor_id = ?').bind(
      likedId,
      actorId,
    )
    const resp = await stmtExists.run()

    if (resp.results.length === 1) {
      isOK = true
      this.dbLikeId = (resp.results[0] as DBId).id
    }

    return isOK
  }

  retrieve = async (): Promise<AP.Like | undefined> => {
    if (!await this.exists()) {
      return undefined
    }

    let dbResp: DBDocumentInfo | undefined = undefined
    const stmtExists = this.handle.prepare(
      'SELECT d.document AS doc, d.r2key, d.r2index, d.url FROM documents d JOIN likes l ON d.id = l.document_id WHERE l.liked_id = ?',
    ).bind(this.dbLikeId)
    const resp = await stmtExists.run()

    if (resp.results.length === 1) {
      dbResp = (resp.results as Array<DBDocumentInfo>)[0]
    }

    if (dbResp === undefined) {
      return undefined
    }

    if (dbResp.r2key) {
      /*
      const cache = this.env.cache()
      if (!cache) {
        return undefined;
      }
      return cache.get(info.r2key, info.r2index) as AP.Like | undefined
      */
      throw new NotImplementedError()
    }

    if (dbResp.url) {
      const doc = await this.env.localGet(dbResp.url)

      if (doc !== undefined) {
        AP.assert.isApType<AP.Like>(doc, 'Like')
      }

      return doc
    }

    const ret = Json.parse<AP.Like>(dbResp.doc)

    AP.assert.isApType<AP.Like>(ret, 'Like')
    return ret
  }
}
