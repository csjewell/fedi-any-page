/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import {
  type Database as APDatabase, NotImplementedError, type Types, Utils,
} from '@csjewell-activitypub/general'
import * as AP from '@csjewell-activitypub/types'
import type { Database, Statement } from 'better-sqlite3'
import type { SQLiteDatabase } from './database.ts'

type RepliesStorage = APDatabase.StorageHandler<Types.ReplyList> & APDatabase.RepliesHandler
type InfoRet = {
  id              : number,
  replyId         : number,
  identifier      : string,
  actorUsername   : string,
  actorName       : string,
  actorLink       : string,
  actorInbox      : string,
  dateUnparsed    : number,
  contentUnparsed : Buffer | undefined,
  isPrivateNum    : number,
  isHiddenNum     : number,
}

type IdRet = {
  documentId : number | undefined,
  replyId    : number | undefined,
}

export class RepliesSQLiteStorage
implements RepliesStorage {
  private readonly router     : SQLiteDatabase
  private readonly handle     : Database
  private readonly message    : AP.ExtendedObjectReference
  private readonly actorId    : number | undefined
  private readonly statements : {
    numLikes   : Statement,
    isLiked    : Statement,
    replyIndex : Statement,
    infoById   : Statement,
  }
  private dbId         : number | undefined = undefined
  private dbDocumentId : number | undefined = undefined
  private listCache    : Types.ReplyList | undefined = undefined

  constructor(
    router: SQLiteDatabase,
    message: AP.ExtendedObjectReference,
    actorId: number | undefined = undefined,
  ) {
    this.router = router
    this.handle = this.router.handle
    this.message = message
    this.actorId = actorId

    this.statements = {
      numLikes : this.handle.prepare(`
        SELECT COUNT(*) AS count
          FROM likes
         WHERE document_liked_id = ?
      `),
      isLiked : this.handle.prepare(`
        SELECT COUNT(*) AS count
          FROM likes
         WHERE document_liked_id = ?
           AND actor_id = ?
      `),
      replyIndex : this.handle.prepare(`
        SELECT d.id AS index,
               d.identifier
          FROM replies r
          JOIN documents d ON r.document_id = d.id
         WHERE r.reply_document_id = ?
      `),
      infoById : this.handle.prepare(`
        SELECT d.id,
               d.identifier,
               a.username   AS actorUsername,
               a.name       AS actorName,
               a.identifier AS actorLink,
               a.inbox      AS actorInbox,
               r.created    AS dateUnparsed,
               r.id         AS replyId,
               d.document   AS contentUnparsed,
               r.private    AS isPrivateNum,
               r.hidden     AS isHiddenNum
          FROM replies r
          JOIN documents d ON r.document_id = d.id
          JOIN actors a ON r.actor_id = a.id
         WHERE d.id = ?
         LIMIT 1
      `),
    }
  }

  databaseId = (): number | undefined => {
    return this.dbId
  }

  document = (): Types.ReplyList | undefined => {
    return this.listCache
  }

  remove = (): boolean => {
    throw new NotImplementedError()
  }

  save = (...args: Array<unknown>): boolean => {
    if (this.dbDocumentId !== undefined) {
      return true
    }

    // TODO: Handle AP.Undo as well.
    let message = args[0] as AP.Create | undefined

    if (message === undefined && AP.guard.isApType<AP.Create>(this.message, 'Create')) {
      message = this.message
    }

    if (message?.id === undefined || message.id === null) {
      return false
    }

    const creationIdent = message.id.toString()

    if (Array.isArray(message.object)) {
      throw new TypeError('Cannot handle multiple replies being created')
    }

    if (message.object instanceof URL) {
      // TODO: fetch message.object, either from database or from web.
      throw new NotImplementedError('Retrieving reply via URL is not handled yet')
    }

    if (!AP.guard.isApExtendedObject(message.object)) {
      return false
    }

    const objectIdent = Utils.idToString((message.object as AP.ExtendedObject).id)

    if (objectIdent === undefined) {
      throw new Error('Our reply cannot be replied to, as it cannot be identified')
    }

    const replyTo = (message.object as AP.ExtendedObject).inReplyTo

    if (replyTo === undefined) {
      throw new Error('Our reply is not replying to anything')
    }

    if (Array.isArray(replyTo)) {
      // If you are inReplyTo more than one thing, where do we insert you
      // into the chain?
      throw new NotImplementedError('Trying to reply to more than one thing')
    }

    const replyToIdent = (replyTo as URL).toString()

    const actorRef = message.object.attributedTo as AP.ActorReference
    const actorIdInfo  = this.getActorId(actorRef)

    if (actorIdInfo.userId === undefined && actorIdInfo.actorId === undefined) {
      throw new Error('Cannot attribute the reply to anybody')
    }

    let creationIds = this.getDocumentIdFromIdent(creationIdent)
    let objectIds = this.getDocumentIdFromIdent(objectIdent)
    let replyIds = this.getDocumentIdFromIdent(replyToIdent)

    creationIds = creationIds ?? { documentId: undefined, replyId: undefined, }
    objectIds = objectIds ?? { documentId: undefined, replyId: undefined, }
    replyIds = replyIds ?? { documentId: undefined, replyId: undefined, }

    if (creationIds.documentId === undefined && objectIds.replyId !== undefined) {
      // We were already created, but our creation IDs do not match up.
      // Since we were already created somehow, don't save anything.
      return false
    }

    if (replyIds.documentId === undefined) {
      // We do not have a record of what you are replying to...
      return false
    }

    if (objectIds.documentId === undefined) {
      const doc = this.router.documentEntry(message.object)

      if (doc.save()) {
        objectIds.documentId = doc.databaseId()
      } else {
        throw new Error('Reply document was not saved')
      }
    }

    if (creationIds.documentId === undefined) {
      const doc = this.router.documentEntry(message)

      if (doc.save()) {
        creationIds.documentId = doc.databaseId()
        this.dbDocumentId = creationIds.documentId
      } else {
        throw new Error('Create document for Reply was not saved')
      }
    }

    if (objectIds.replyId === undefined) {
      const stmtInsert = this.handle.prepare(`
        INSERT
          INTO replies
               (message_identifier, document_id, reply_document_id,
                creation_document_id, user_id, actor_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      const respInsert = stmtInsert.run(
        objectIdent, objectIds.documentId, replyIds.documentId,
        creationIds.documentId, actorIdInfo.userId ?? null, actorIdInfo.actorId ?? null,
      )

      if (respInsert.changes === 0) {
        throw new Error('Reply entry was not saved')
      }

      objectIds.replyId = respInsert.lastInsertRowid as number
      this.dbId = objectIds.replyId

      if (message.object.sensitive ?? false) {
        // Hide reply if message.object.sensitive is true
        const stmtHide = this.handle.prepare(`
          UPDATE replies
             SET hidden = 1,
                 why_hidden = 'Sensitive flag set on message'
           WHERE id = ?
        `)
        const respHide = stmtHide.run(this.dbId)

        if (respHide.changes === 0) {
          console.warn('Could not save hidden flag in reply id %s', this.dbId)
        }
      }


      return respInsert.changes > 0
    }

    throw new NotImplementedError()
  }

  private readonly getActorId = (
    actorRef: AP.ActorReference,
  ): {
    userId  : number | undefined,
    actorId : number | undefined,
  } => {
    const actorIdent = (actorRef as URL).toString()
    const stmtLocalActor = this.handle.prepare(`
        SELECT id
          FROM users
         WHERE actor_identifier = ?
      `)
    const respLocalActor = stmtLocalActor.get(actorIdent) as
      { id: number } | undefined

    if (respLocalActor === undefined) {
      const actorTable = this.router.actor(actorRef)

      if (actorTable.retrieve()) {
        return { userId: undefined, actorId: actorTable.databaseId(), }
      }
      throw new Error('Actor was not saved')
    }

    return { userId: respLocalActor.id, actorId: undefined, }
  }

  private readonly retrieveNumLikes = (docId: number): number => {
    let numLikes = this.statements.numLikes.get(docId) as
      undefined | { count: number }

    numLikes = numLikes ?? { count: 0, }
    return numLikes.count
  }

  private readonly retrieveReplyIndex = (docId: number): Array<Types.IndexEntry> => {
    return this.statements.replyIndex.all(docId) as Array<Types.IndexEntry>
  }

  private readonly retrieveIsLiked = (docId: number, actorId: number): boolean => {
    let isLiked = this.statements.isLiked.get(docId, actorId) as
      undefined | { count: number }

    isLiked = isLiked ?? { count: 0, }
    return isLiked.count > 0
  }

  exists = (): boolean => {
    if (this.listCache !== undefined || this.dbId !== undefined) {
      return true
    }

    if (this.message instanceof URL) {
      const info = this.getDocumentIdFromIdent(this.message.toString())

      if (info !== undefined) {
        this.dbId = info.replyId
        return true
      }
    }

    return false
  }

  private readonly retrieveOnceById = (docId: number): Types.ReplyInfo | undefined => {
    const dbResponse = this.statements.infoById.get(docId) as undefined | InfoRet

    if (dbResponse === undefined) {
      return undefined
    }

    return this.toReplyInfo(dbResponse)
  }

  private readonly getDocumentIdFromIdent = (ident: string): IdRet | undefined => {
    const infoByIdentifier = this.handle.prepare(`
      SELECT r.document_id AS documentId, r.id AS replyId
        FROM documents d
   LEFT JOIN replies r ON (d.id = r.document_id OR d.id = r.creation_document_id)
       WHERE d.identifier = ?
       LIMIT 1
    `)

    return infoByIdentifier.get(ident) as undefined | IdRet
  }

  private readonly toReplyInfo = (dbResponse: InfoRet): Types.ReplyInfo => {
    const info: Types.ReplyInfo = {
      identifier : dbResponse.identifier,
      date       : new Date(dbResponse.dateUnparsed),
      content    : '',
      isPrivate  : dbResponse.isPrivateNum === 1,
      isHidden   : dbResponse.isHiddenNum === 1,
      databaseId : dbResponse.replyId,
      numLikes   : this.retrieveNumLikes(dbResponse.id),
      replyIndex : this.retrieveReplyIndex(dbResponse.id),
      replyTo    : {
        username   : dbResponse.actorUsername,
        actorName  : dbResponse.actorName,
        actorLink  : dbResponse.actorLink,
        actorInbox : dbResponse.actorInbox,
      },
    }

    if (dbResponse.contentUnparsed === undefined) {
      // TODO: Change to something like config.getLocalURL(dbResponse.contentURL)
      info.content = ''
    } else {
      info.content = dbResponse.contentUnparsed.toString('utf8')
    }

    if (this.actorId !== undefined) {
      info.liked = this.retrieveIsLiked(dbResponse.id, this.actorId)
    }

    return info
  }

  retrieve = (): Types.ReplyList | undefined => {
    if (this.listCache !== undefined) {
      return this.listCache
    }

    if (this.message instanceof URL) {
      const initial = this.getDocumentIdFromIdent(this.message.toString())

      if (initial === undefined) {
        return undefined
      }
      if (initial.documentId === undefined) {
        return undefined
      }

      const draftReplyIndex: Array<Types.IndexEntry>
        = this.retrieveReplyIndex(initial.documentId)

      const replyIndex: Array<Types.IndexEntry> = []
      const replies: Array<Types.ReplyInfo> = []

      for (const draftIndexEntry of draftReplyIndex) {
        const next = this.retrieveRecursive(draftIndexEntry)

        if (next === undefined) {
          continue
        }

        const len = replies.length

        replyIndex.push({
          index      : next.replyIndex[0].index + len,
          identifier : next.replyIndex[0].identifier,
        })
        replies.push(...next.replies.map(reply => this.addToIndexEntries(reply, len)))
      }

      this.listCache = { replies, replyIndex, }
      return this.listCache
    }

    throw new NotImplementedError()
  }

  private readonly retrieveRecursive = (
    entry: Types.IndexEntry,
  ): Types.ReplyList | undefined => {
    const reply = this.retrieveOnceById(entry.index)

    if (reply === undefined) {
      return undefined
    }
    /* eslint-disable-next-line logical-assignment-operators */
    reply.replyIndex ??= []

    // Clone it, because we are overwriting it later.
    const draftReplyIndex = reply.replyIndex.map(indexEntry => ({ ...indexEntry,}))

    const baseIndexEntry: Types.IndexEntry = {
      index      : 0,
      identifier : reply.identifier,
    }

    if (reply.replyIndex.length === 0) {
      return {
        replies    : [reply],
        replyIndex : [baseIndexEntry],
      }
    }

    const replyIndex: Array<Types.IndexEntry> = []
    const replies: Array<Types.ReplyInfo> = []

    for (const draftIndexEntry of draftReplyIndex) {
      const next = this.retrieveRecursive(draftIndexEntry)

      if (next === undefined) {
        continue
      }

      // The +1 is so we can unshift the current reply onto it at the end
      // without having to do another 'addToIndexEntries' mapping later
      // just to add one to each entry then.
      const len = replies.length + 1

      replyIndex.push({
        index      : next.replyIndex[0].index + len,
        identifier : next.replyIndex[0].identifier,
      })
      replies.push(...next.replies.map(oneReply => this.addToIndexEntries(oneReply, len)))
    }

    reply.replyIndex = replyIndex
    replies.unshift(reply)
    return { replies, replyIndex: [baseIndexEntry], }
  }

  private readonly addToIndexEntries = (
    reply: Types.ReplyInfo,
    i: number,
  ): Types.ReplyInfo => {
    /* eslint-disable-next-line logical-assignment-operators */
    reply.replyIndex ??= []

    if (reply.replyIndex.length === 0) {
      return reply
    }

    const replyIndex = reply.replyIndex.map((indexEntry) => {
      return { ...indexEntry, index: indexEntry.index + i, }
    })

    reply.replyIndex = replyIndex
    return reply
  }

  shorten = (): { url: URL | undefined; id: number | undefined } => {
    throw new NotImplementedError()
  }

  hideCurrentReply = (_isHidden: boolean): Promise<boolean> => {
    throw new NotImplementedError()
  }

  getNextPage = (_page: number): Promise<unknown> => {
    throw new NotImplementedError()
  }
}
