/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { type Database as APDatabase, Json, NotImplementedError, Utils } from '@csjewell-activitypub/general'
import * as AP from '@csjewell-activitypub/types'
import type { Database } from 'better-sqlite3'
import type { SQLiteDatabase } from './database.ts'

type LikeInfo = {
  actorId : string
  created : unknown
}

type ValidLike = { isValid: false } | {
  isValid : true,
  actorId : string,
  likedId : string,
}

type DBDocumentInfo = {
  doc : string
  url : string
}

export class LikeSQLiteStorage
implements APDatabase.StorageHandler<AP.Like> {
  private readonly router  : SQLiteDatabase
  private readonly handle  : Database
  private readonly message : AP.Like
  private dbLikeId         : number | undefined = undefined
  private url = new URL('https://test-sqlite.localhost')

  constructor(router: SQLiteDatabase, message: AP.Like) {
    this.router = router
    this.handle = this.router.handle
    this.message = message
  }

  databaseId = (): number | undefined => {
    return this.dbLikeId
  }

  document = (): AP.Like => {
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
    const { object, } = this.router.getDocument(this.message.object)

    if (object === undefined) {
      return { isValid: false, }
    }

    const likedId = object.id

    if (likedId === undefined || likedId === null) {
      return { isValid: false, }
    }

    if (likedId.hostname !== this.url.hostname) {
      // If we aren't ourselves, we were never here.
      return { isValid: false, }
    }

    return { isValid: true, likedId: likedId.toString(), actorId, }
  }

  count = (er: AP.EntityReference): number => {
    const erURL = Utils.entityRefToURL(er)

    if (erURL === undefined) {
      return 0
    }

    if (erURL.hostname !== this.url.hostname) {
      // If we aren't ourselves, we were never here.
      return 0
    }

    const stmtLikes = this.handle.prepare(`
      SELECT COUNT(*) AS count
        FROM likes
       WHERE liked_id = ?
         AND deletable = 0
    `)
    const resp = stmtLikes.all(erURL.toString())

    return (resp[0] as { count: number }).count
  }

  list = (er: AP.EntityReference, getPrivate = false): Array<LikeInfo> => {
    const erURL = Utils.entityRefToURL(er)

    if (erURL === undefined) {
      return []
    }

    if (erURL.hostname !== this.url.hostname) {
      // If we aren't ourselves, we were never here.
      return []
    }

    const likes: Array<LikeInfo> = []
    const sqlPrivate = getPrivate ? '' : 'AND private = 0'

    const stmtLikes = this.handle.prepare(`
      SELECT actor_id, created
        FROM likes
       WHERE liked_id = ? ${ sqlPrivate }
         AND deletable = 0
    `)
    const resp = stmtLikes.all(erURL.toString())

    if (resp.length > 0) {
      (resp as Array<LikeInfo>).forEach((info) => {
        likes.push(({ ...info, } as LikeInfo))
      })
    }

    return likes
  }

  remove = (): boolean => {
    // If from Mastodon - someone un-liked the post. We need to delete it from the store.
    const messageInfo = this.validateMessage()

    if (!messageInfo.isValid) {
      return false
    }

    const { actorId, likedId, } = messageInfo

    console.info(`Attempting to delete Like ${ actorId } on ${ likedId }`)

    const stmtDel = this.handle.prepare(`
      DELETE FROM likes WHERE liked_id = ? AND actor_id = ?
    `)
    const resp = stmtDel.run(likedId, actorId)

    console.info(`Deleted Like of ${ actorId } on ${ likedId }`)
    console.info(resp)
    return true
  }

  save = (): boolean => {
    const messageInfo = this.validateMessage()

    if (!messageInfo.isValid) {
      return false
    }

    const { actorId, likedId, } = messageInfo

    // Shorten up what gets saved.
    this.message.object = new URL(likedId)
    this.message.actor = new URL(actorId)

    const documentObj = this.router.documentEntry(this.message).shorten() as {
      url : URL | undefined,
      id  : number | undefined,
    }

    if (documentObj.url === undefined) {
      return false
    }

    const stmtInsert = this.handle.prepare(`
      INSERT INTO likes (liked_id, actor_id, document_id)
           VALUES       (       ?,        ?,           ?)
    `)
    const resp = stmtInsert.run(likedId, actorId, documentObj.id as number)

    this.dbLikeId = resp.lastInsertRowid as number
    return true
  }

  exists = (): boolean => {
    if (this.dbLikeId) {
      return true
    }

    const messageInfo = this.validateMessage()

    if (!messageInfo.isValid) {
      return false
    }

    const { actorId, likedId, } = messageInfo

    let isOK = false
    const stmtExists = this.handle.prepare(`
      SELECT id FROM likes WHERE liked_id = ? AND actor_id = ?
    `)
    const resp = stmtExists.all(likedId, actorId)

    if (resp.length === 1) {
      isOK = true
      this.dbLikeId = (resp[0] as { id: number }).id
    }

    return isOK
  }

  retrieve = async (): Promise<AP.Like | undefined> => {
    if (!this.exists()) {
      return undefined
    }

    let dbResp: DBDocumentInfo | undefined = undefined
    const stmtExists = this.handle.prepare(`
      SELECT d.document AS doc, d.url
        FROM documents d
        JOIN likes l ON d.id = l.document_id
       WHERE l.liked_id = ?
    `)
    const resp = stmtExists.all(this.dbLikeId as number)

    if (resp.length === 1) {
      dbResp = (resp as Array<DBDocumentInfo>)[0]
    }

    if (dbResp === undefined) {
      return undefined
    }

    if (dbResp.url) {
      const doc = await this.localGet(dbResp.url)

      if (doc !== undefined) {
        AP.assert.isApType<AP.Like>(doc, 'Like')
        return doc
      }

      return undefined
    }

    const ret = Json.parse<AP.Like>(dbResp.doc)

    AP.assert.isApType<AP.Like>(ret, 'Like')
    return ret
  }

  shorten = (): { url: URL | undefined; id: number | undefined } => {
    throw new NotImplementedError()
  }

  /* Temporary location while we get things right. */
  /* eslint-disable-next-line @typescript-eslint/require-await */
  localGet = async (_s: string) : Promise<AP.CoreObject | undefined> => {
    throw new NotImplementedError()
  }
}
