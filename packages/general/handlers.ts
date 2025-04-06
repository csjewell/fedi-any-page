/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { NAMESPACE_URL, v5 as uuid } from '@std/uuid'
import * as KitUtils from './utilities.ts'
import type * as AP from '@csjewell-activitypub/types'
import type { Configuration } from './configuration.ts'
import type { DatabaseRouter } from './database/router.ts'
import type * as Request from './request.ts'
import type { Responses } from './responses.ts'

export class Router<SessionT, ResponseT>
implements Request.Router<SessionT, ResponseT> {
  protected kdb               : DatabaseRouter<unknown, unknown, unknown>
  protected resp              : Responses<SessionT, ResponseT>
  protected readonly env      : Configuration<unknown, unknown, unknown>
  protected readonly username : string

  constructor(
    kdb: DatabaseRouter<unknown, unknown, unknown>,
    resp: Responses<SessionT, ResponseT>,
    env: Configuration<unknown, unknown, unknown>,
    username: string,
  ) {
    this.kdb = kdb
    this.resp = resp
    this.env = env
    this.username = username.toLowerCase()
  }

  async create(message: AP.Create): Promise<ResponseT> {
    console.info('Handling Create message')
    // Someone is sending us a message.

    if (message.id === null) {
      return this.resp.error422({ info: 'No message ID to create', })
    }

    // Verify whether message.object can be null or undefined.
    // if (message.object === null) {
    //   return this.resp.error422({ info: 'No object to create', })
    // }

    // We are only interested in Replies - that is a "Note" with a "replyTo"
    const createObject = message.object as AP.CoreObject

    if (createObject.type === 'Note') {
      if (createObject.inReplyTo === undefined) {
        return this.resp.error422({
          info : 'Cannot "Create" a "Note" that is not a reply',
        })
      }

      if (
        !KitUtils.isObjectOurs(this.env.url.hostname, createObject.inReplyTo)
      ) {
        return this.resp.error422({ info: 'The replying note was misrouted', })
      }

      const hasSavedNote = await this.kdb.note(createObject as AP.Note).save()

      if (hasSavedNote) {
        return this.resp.success202({ info: 'Created Reply', })
      }

      //return this.resp.error500({ info: 'Database error storing reply' })
      return this.resp.error422({ info: 'Database error storing reply', })
    }

    return this.resp.error422({
      info : 'Cannot "Create" an unknown message object type',
    })
  }

  async follow(message: AP.Follow): Promise<ResponseT> {
    // We are following.
    if (message.id === null) {
      return this.resp.error422({
        info : 'No message ID to use when following',
      })
    }

    const messageStorage = this.kdb.follow(message)

    // X: const actorID = getActorId(<EntityReference>this.message.actor).toString()

    if (await messageStorage.exists()) {
      console.info('Already Following')
      return this.resp.success204({ info: 'Already following', })
    }

    // Create the follow.
    const url = new TextEncoder().encode(this.env.url.toString())
    /* eslint-disable-next-line @typescript-eslint/no-unsafe-call -- WHY can't eslint find it? */
    const guid = (await uuid.generate(NAMESPACE_URL, url)) as string
    const hasSaved = await messageStorage.save(guid)

    if (hasSaved) {
      const _acceptRequest: AP.Accept = {
        '@context' : new URL('https://www.w3.org/ns/activitystreams'),
        'id'       : new URL(`${ this.env.url.toString() }${ this.username }#${ guid }`),
        'type'     : 'Accept',
        'actor'    : new URL(
          `${ this.env.url.toString() }${ this.username }`,
        ) as AP.EntityReference,
        'object' : message.id as AP.EntityReference,
      }
    }

    /* TODO: Finish up
      const actorInbox = actorInformation.inbox as URL
      console.log('sending follow accept:', actorInbox, acceptRequest)
      const response = await this.sendSignedRequest(actorInbox, acceptRequest)
      console.log('Following result', response.status, response.statusText, await response.text())
      // Check response.status
    */

    //return this.resp.error500()
    return this.resp.error422()
  }

  async undo(message: AP.Undo): Promise<ResponseT> {
    if (message.id === null) {
      return this.resp.error422({ info: 'No object ID', })
    }

    // Verify whether message.object can be null or undefined.
    // if (message.object === null) {
    //   return this.resp.error422({ info: 'No object to undo', })
    // }

    const { object, } = this.kdb.getDocument(message.object)

    if (object === undefined) {
      return this.resp.error422({ info: 'No actor', })
    }

    if (!('actor' in object)) {
      return this.resp.error422({ info: 'No actor', })
    }

    if (!('object' in object)) {
      return this.resp.error422({ info: 'No object to act upon', })
    }

    let hasSavedUndo: boolean
    const type = object.type as string

    switch (type) {
      case 'Follow': {
        hasSavedUndo = await this.kdb.follow(object as AP.Follow).remove()
        break
      }

      case 'Like': {
        hasSavedUndo = await this.kdb.like(object as AP.Like).remove()
        break
      }

      case 'Announce': {
        hasSavedUndo = await this.kdb.announce(object as AP.Announce).remove()
        break
      }

      default: {
        return this.resp.error422({ info: `Cannot undo a ${ type } object`, })
      }
    }

    // TODO: Handle `success` better.
    return hasSavedUndo
      ? this.resp.success202({ info: 'Handled Undo', })
      : this.resp.error500()
  }
}
