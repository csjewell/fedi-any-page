/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import * as AP from '@csjewell-activitypub/types'
import type { Configuration } from '../../configuration.ts'
import type * as Request from '../../request.ts'
import type { Type as Responses } from '../../responses.ts'
import type { APIHandler } from './types.ts'

export const Action: APIHandler = async <DatabaseT, ResponseT>(
  config: Configuration<DatabaseT>,
  req: Request.Helper,
  resp: Responses<ResponseT>,
): Promise<ResponseT> => {
  const url = config.url.toString()

  if (req.canAcceptHTML()) {
    return resp.redirect30x({ url, statusCode: 301, })
  }

  const cookiesIn = await req.getCookieInputs()
  const username = cookiesIn.actinf

  if (username === undefined || cookiesIn.actinfo === undefined) {
    return resp.error403()
  }

  const session = await config.database.session(cookiesIn)
  const actorMe = await session.getActor()

  const reqInfo = await req.getReplyActionInputs()

  if (reqInfo.action === 'hide') {
    const rep = config.database.replies(new URL(reqInfo.identifier))

    await rep.hideCurrentReply(!reqInfo.isUndo)
    return resp.success200Str({
      body : JSON.stringify({ success: true, }),
    })
  }

  const { object, } = config.database.getDocument(reqInfo.identifier)
  let replyTo = object!.attributedTo

  if (replyTo === undefined) {
    return resp.error500({ info: 'Nobody to reply to', })
  }

  if (!Array.isArray(replyTo)) {
    replyTo = [replyTo] as Array<AP.EntityReference>
  }

  let body: AP.Activity

  if (reqInfo.isUndo) {
    // TODO: Make sure this is right...
    body = {
      '@context' : new URL('https://www.w3.org/ns/activitystreams'),
      'id'       : new URL(config.getActorBasedId(username, 'undo')),
      'summary'  : 'Somebody unliked your reply',
      'type'     : 'Undo',
      'object'   : new URL(reqInfo.identifier),
      'actor'    : actorMe,
    }
  } else {
    body = {
      '@context' : new URL('https://www.w3.org/ns/activitystreams'),
      'id'       : new URL(config.getActorBasedId(username, 'like')),
      'summary'  : 'Somebody liked your reply',
      'type'     : 'Like',
      'object'   : new URL(reqInfo.identifier),
      'actor'    : actorMe,
    }
  }

  const sentIdentifiers: Array<string> = []

  for (const actorThemRef of replyTo) {
    let actorInbox: AP.OrderedCollectionReference

    if (AP.guard.isApActor(actorThemRef) && 'id' in actorThemRef) {
      // They sent the whole actor... unusual, but I'll take it...
      actorInbox = actorThemRef.inbox
    } else {
      const actorThem = await config.database.actor(actorThemRef as AP.ActorReference).retrieve()

      if (actorThem === undefined) {
        continue
      }
      actorInbox = actorThem.inbox
    }

    let actorInboxURL: URL

    if (AP.guard.isApCollection(actorInbox) && 'id' in actorInbox) {
      // They returned the whole OrderedCollection... REALLY odd.
      // just try the next one.
      continue
    } else {
      actorInboxURL = actorInbox as URL
    }

    await resp.sender({ config, username: 'server', }).sendSignedRequest(
      actorInboxURL, body)

    sentIdentifiers.push(body.id!.toString())
  }

  if (sentIdentifiers.length > 0) {
    return resp.success201({
      identifiers : sentIdentifiers,
      cookies     : await session.refreshCookies(),
    })
  }

  return resp.error422({ info: 'No valid actors', })
}

export const Reply: APIHandler = async <DatabaseT, ResponseT>(
  config: Configuration<DatabaseT>,
  req: Request.Helper,
  resp: Responses<ResponseT>,
): Promise<ResponseT> => {
  const url = config.url.toString()

  if (req.canAcceptHTML()) {
    return resp.redirect30x({ url, statusCode: 301, })
  }

  const body = {}

  return resp.success200Obj({ body, })
}

export const Announce: APIHandler = async <DatabaseT, ResponseT>(
  config: Configuration<DatabaseT>,
  req: Request.Helper,
  resp: Responses<ResponseT>,
): Promise<ResponseT> => {
  const url = config.url.toString()

  if (req.canAcceptHTML()) {
    return resp.redirect30x({ url, statusCode: 301, })
  }

  const cookiesIn = await req.getCookieInputs()
  const username = cookiesIn.actinf

  if (username === undefined || cookiesIn.actinfo === undefined) {
    return resp.error403()
  }

  const session = await config.database.session(cookiesIn)
  const actorMe = await session.getActor()

  const reqInfo = await req.getAnnounceInputs()

  const body: AP.Activity = {
    '@context'  : new URL('https://www.w3.org/ns/activitystreams'),
    'id'        : new URL(config.getActorBasedId(username, 'announce')),
    'type'      : 'Announce',
    'actor'     : actorMe,
    'published' : new Date(Date.now()),
    'object'    : new URL(reqInfo.identifier),
  }
  const cc: Array<AP.EntityReference> = []

  const { object, } = config.database.getDocument(reqInfo.identifier)

  if (object === undefined) {
    return resp.error404({ info: 'Object being announced', })
  }

  if (object.attributedTo !== undefined) {
    let destination = object.attributedTo

    if (!Array.isArray(destination)) {
      destination = [destination] as Array<AP.EntityReference>
    }
    cc.push(...destination)
  }

  const followers = new URL(session.document()!.followersLink!)

  if (reqInfo.privacy === 'public') {
    cc.push(followers)
    body.to = new URL('https://www.w3.org/ns/activitystreams#Public')
  } else {
    body.to = followers
  }
  body.cc = cc
  await config.database.sendToOutbox(username, reqInfo.privacy === 'public', body)
  return resp.success201({ identifiers: [body.id!.toString()], })
}
