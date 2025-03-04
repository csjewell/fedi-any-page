/* SPDX-License-Identifier: MIT */
import { NAMESPACE_URL, v5 as uuid } from '@std/uuid'
import * as KitUtils from './utilities.ts'
import type * as Kit from './interfaces.ts'
import type * as AP from '@csjewell-activitypub/types'

export class Router implements Kit.RequestRouter {
  protected kdb: Kit.DatabaseRouter
  protected resp: Kit.Responses
  protected readonly env: Kit.Configuration
  protected readonly username: string

  constructor(kdb: Kit.DatabaseRouter, resp: Kit.Responses, env: Kit.Configuration, username: string) {
    this.kdb = kdb
    this.resp = resp
    this.env = env
    this.username = username.toLowerCase()
  }

  create(message: AP.Create): Kit.RequestHandler {
    return new HandleCreate(this.kdb, this.resp, this.env, this.username, message)
  }

  follow(message: AP.Follow): Kit.RequestHandler {
    return new HandleFollow(this.kdb, this.resp, this.env, this.username, message)
  }

  undo(message: AP.Undo): Kit.RequestHandler {
    return new HandleUndo(this.kdb, this.resp, this.env, this.username, message)
  }
}

class HandleCreate extends Router implements Kit.RequestHandler {
  message: AP.Create
  constructor(
    kdb: Kit.DatabaseRouter,
    resp: Kit.Responses,
    env: Kit.Configuration,
    username: string,
    message: AP.Create,
  ) {
    super(kdb, resp, env, username)
    this.message = message
  }

  async handle(): Promise<unknown> {
    console.log('Handling Create message')
    // Someone is sending us a message.

    if (this.message.id === null) {
      return this.resp.error422({ info: 'No message ID to create' })
    }

    if (this.message.object === null) {
      return this.resp.error422({ info: 'No object to create' })
    }

    // We are only interested in Replies - that is a "Note" with a "replyTo"
    const createObject = this.message.object as AP.CoreObject
    if (createObject.type === 'Note') {
      if (createObject.inReplyTo === undefined) {
        return this.resp.error422({ info: 'Cannot "Create" a "Note" that is not a reply' })
      }

      if (!KitUtils.isObjectOurs(this.env.url.hostname, createObject.inReplyTo)) {
        return this.resp.error422({ info: 'The replying note was misrouted' })
      }

      const success = await this.kdb.note(createObject as AP.Note).save()
      if (success) {
        return this.resp.success202({ info: 'Created Reply' })
      }

      //return this.resp.error500({ info: 'Database error storing reply' })
      return this.resp.error422({ info: 'Database error storing reply' })
    }

    return this.resp.error422({ info: 'Cannot "Create" an unknown message object type' })
  }
}

class HandleFollow extends Router implements Kit.RequestHandler {
  message: AP.Follow
  constructor(
    apdb: Kit.DatabaseRouter,
    resp: Kit.Responses,
    env: Kit.Configuration,
    username: string,
    message: AP.Follow,
  ) {
    super(apdb, resp, env, username)
    this.message = message
  }

  async handle(): Promise<unknown> {
    // We are following.
    const messageId = this.message.id as AP.EntityReference
    if (messageId === null) {
      return this.resp.error422({ info: 'No message ID to use when following' })
    }

    const messageStorage = this.kdb.follow(this.message)

    // X: const actorID = getActorId(<EntityReference>this.message.actor).toString()

    if (await messageStorage.exists()) {
      console.log('Already Following')
      return this.resp.success204({ info: 'Already following' })
    }

    // Create the follow.
    // TODO: Use the correct URL.
    const url = new TextEncoder().encode('https://test.example')
    const guid = uuid.generate(NAMESPACE_URL, url)
    const success = await messageStorage.save(guid)
    if (success) {
      const _acceptRequest: AP.Accept = {
        '@context': new URL('https://www.w3.org/ns/activitystreams'),
        id: new URL(`${this.env.url.toString()}${this.username}#${guid}`),
        type: 'Accept',
        actor: new URL(`${this.env.url.toString()}${this.username}`) as AP.EntityReference,
        object: messageId,
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
}

class HandleUndo extends Router implements Kit.RequestHandler {
  message: AP.Undo
  constructor(
    apdb: Kit.DatabaseRouter,
    resp: Kit.Responses,
    env: Kit.Configuration,
    username: string,
    message: AP.Undo,
  ) {
    super(apdb, resp, env, username)
    this.message = message
  }

  async handle(): Promise<unknown> {
    if (this.message === null || this.message.id === null) {
      return this.resp.error422({ info: 'No object ID' })
    }

    if (this.message.object === null) {
      return this.resp.error422({ info: 'No object to undo' })
    }

    const { object } = this.kdb.getDocument(this.message.object)

    if (object === undefined) {
      return this.resp.error422({ info: 'No actor' })
    }

    if (!('actor' in object)) {
      return this.resp.error422({ info: 'No actor' })
    }

    if (!('object' in object)) {
      return this.resp.error422({ info: 'No object to act upon' })
    }

    let success: boolean
    const type = object.type as string
    switch (type) {
      case 'Follow': {
        success = await this.kdb.follow(object as AP.Follow).remove()
        break
      }

      case 'Like': {
        success = await this.kdb.like(object as AP.Like).remove()
        break
      }

      case 'Announce': {
        success = await this.kdb.announce(object as AP.Announce).remove()
        break
      }

      default: {
        return this.resp.error422({ info: `Cannot undo a ${type} object` })
      }
    }

    // TODO: Handle `success` better.
    return success ? this.resp.success202({ info: 'Handled Undo' }) : this.resp.error500()
  }
}
