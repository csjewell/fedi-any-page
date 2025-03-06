/* SPDX-License-Identifier: MIT */
import * as Kit from '@csjewell-activitypub/general'
import { NotImplementedError } from '@csjewell-activitypub/general/errors'
import type { default as Configuration } from '@csjewell-activitypub/general/configuration'
import type { Database } from '@csjewell-activitypub/general/database/handler'
import * as Json from '@csjewell-activitypub/json'
import * as AP from '@csjewell-activitypub/types'
import { CloudflareD1Database } from './router.ts'
import type { DBCount, DBDocumentInfo, DBId } from './types.ts'

type LikeInfo = {
  actorId: string
  created: unknown
}

export class LikeCFStorage extends CloudflareD1Database implements Database {
  private readonly message: AP.Like
  private dbLikeId: number | undefined = undefined

  constructor(env: Configuration, message: AP.Like) {
    super(env)
    this.message = message
  }

  databaseId(): number | undefined {
    return this.dbLikeId
  }

  document(): AP.Like {
    return this.message
  }

  async count(er: AP.EntityReference): Promise<number> {
    const erURL = Kit.entityRefToURL(er)
    if (erURL === undefined) {
      return 0
    }

    if (erURL.hostname !== this.env.url.hostname) {
      // If we aren't ourselves, we were never here.
      return 0
    }

    let count = 0
    const stmtLikes = this.handle.prepare(
      'SELECT COUNT(*) AS count FROM likes WHERE liked_id = ? AND deletable = 0',
    ).bind(erURL.toString())
    const resp = await stmtLikes.run()
    if (resp.success) {
      count = (resp.results[0] as DBCount).count
    }

    return count
  }

  async list(er: AP.EntityReference, getPrivate = false): Promise<Array<LikeInfo>> {
    const erURL = Kit.entityRefToURL(er)
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
      `SELECT actor_id, created FROM likes WHERE liked_id = ? ${sqlPrivate} AND deletable = 0`,
    ).bind(erURL.toString())
    const resp = await stmtLikes.run()
    if (resp.success && (resp.results.length > 0)) {
      ;(resp.results as Array<LikeInfo>).forEach((info) => likes.push(<LikeInfo> { ...info }))
    }

    return likes
  }

  async remove(): Promise<boolean> {
    // If from Mastodon - someone un-liked the post. We need to delete it from the store.
    const actorId = Kit.getEntityId(this.message.actor)

    const { object } = this.getDocument(this.message.object)
    if (object === undefined) {
      return false
    }

    const likedId = object.id as string | URL | null | undefined
    const likedURL = Kit.idToURL(likedId)
    if (likedURL === undefined) {
      return false
    }

    console.log(`Attempting to delete Like ${actorId} on ${likedURL.toString()}`)
    if (likedURL.hostname !== this.env.url.hostname) {
      // If we aren't ourselves, we were never here.
      return true
    }

    let ok = false
    const stmtDel = this.handle.prepare('DELETE FROM likes WHERE liked_id = ? AND actor_id = ?').bind(likedURL, actorId)
    const resp = await stmtDel.run()
    if (resp.success) {
      ok = true
      console.log(`Deleted Like of ${actorId} on ${likedURL.toString()}`, resp)
    }

    return ok
  }

  async save(): Promise<boolean> {
    const er = this.message.object
    if (Array.isArray(er)) {
      return false
    }
    const erURL = Kit.entityRefToURL(er)
    if ((erURL === undefined) || (erURL.hostname !== this.env.url.hostname)) {
      return false
    }

    const actorER = this.message.actor // EntityReference | Array<EntityReference>, required (so not undefined)
    if (Array.isArray(actorER)) {
      return false
    }

    const actorURL = Kit.entityRefToURL(actorER)
    if (actorURL === undefined) {
      return false
    }

    const actorObj = await this.actor(actorURL).shorten()

    // Shorten up what gets saved.
    this.message.object = erURL
    this.message.actor = actorURL

    const documentObj = await this.documentEntry(this.message).shorten()
    if (documentObj.url === undefined) {
      return false
    }

    let ok = false
    const stmtInsert = this.handle.prepare(`
      INSERT INTO likes (liked_id, actor_id, document_id)
           VALUES       (       ?,        ?,           ?)
    `).bind(erURL.toString(), actorObj.id, documentObj.id)
    const resp = await stmtInsert.run()
    if (resp.success) {
      this.dbLikeId = resp.meta.last_row_id
      ok = true
    }

    return ok
  }

  async exists(): Promise<boolean> {
    if (this.dbLikeId) {
      return true
    }

    const actorId = Kit.getEntityId(this.message.actor)

    const { object } = this.getDocument(this.message.object)
    if (object === undefined) {
      return false
    }

    const likedId = object.id as string | URL | null | undefined
    const likedURL = Kit.idToURL(likedId)
    if (likedURL === undefined) {
      return false
    }

    if (likedURL.hostname !== this.env.url.hostname) {
      // If we aren't ourselves, we were never here.
      return false
    }

    let ok = false
    const stmtExists = this.handle.prepare('SELECT id FROM likes WHERE liked_id = ? AND actor_id = ?').bind(
      likedURL.toString(),
      actorId,
    )
    const resp = await stmtExists.run()
    if (resp.success && (resp.results.length === 1)) {
      ok = true
      this.dbLikeId = (resp.results[0] as DBId).id
    }

    return ok
  }

  async retrieve(): Promise<AP.Like | undefined> {
    if (!this.exists()) {
      return undefined
    }

    let dbResp: DBDocumentInfo | undefined = undefined
    const stmtExists = this.handle.prepare(
      'SELECT d.document AS doc, d.r2key, d.r2index, d.url FROM documents d JOIN likes l ON d.id = l.document_id WHERE l.liked_id = ?',
    ).bind(this.dbLikeId)
    const resp = await stmtExists.run()
    if (resp.success && (resp.results.length === 1)) {
      dbResp = (resp.results as Array<DBDocumentInfo>)[0]
    }

    if (dbResp !== undefined && this.assertIsDBDocumentInfo(dbResp)) {
      const info: DBDocumentInfo = dbResp
      if (info.r2key) {
        /*
        const cache = this.env.cache()
        if (!cache) {
          return undefined;
        }
        return cache.get(info.r2key, info.r2index) as AP.Like | undefined
        */
        throw new NotImplementedError()
      }

      if (info.url) {
        return this.env.localGet(info.url) as AP.Like | undefined
      }

      const ret = Json.parse(info.doc) as AP.Like | undefined
      if (ret !== undefined) {
        AP.assert.isApType<AP.Like>(ret, 'Like')
      }

      return ret
    } else {
      return undefined
    }
  }
}
