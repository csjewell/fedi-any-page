/* SPDX-License-Identifier: MIT */
import { NAMESPACE_URL, v5 as uuid } from '@std/uuid'
import * as KitUtils from './utilities.ts'
import type * as Kit from './interfaces.ts'
import type { AP } from 'activitypub-core-types'
import type { CoreObject, EntityReference } from 'activitypub-core-types/lib/activitypub/index.js'

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
      return this.resp.error422('No message ID to create')
    }

    if (this.message.object === null) {
      return this.resp.error422('No object to create')
    }

    // We are only interested in Replies - that is a "Note" with a "replyTo"
    const createObject = this.message.object as CoreObject
    if (createObject.type === 'Note') {
      if (createObject.inReplyTo === undefined) {
        return this.resp.error422('Cannot "Create" a "Note" that is not a reply')
      }

      if (!KitUtils.isObjectOurs(this.env.url.hostname, createObject.inReplyTo)) {
        return this.resp.error422('The replying note was misrouted')
      }

      const success = await this.kdb.note(createObject as AP.Note).save()
      if (success) {
        return this.resp.success202('Created Reply')
      }

      return this.resp.error500('Database error storing reply')
    }

    return this.resp.error422('Cannot "Create" an unknown message object type')
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
    if (this.message.id === null) {
      return this.resp.error422('No message ID to use when following')
    }

    const messageStorage = this.kdb.follow(this.message)

    // X: const actorID = getActorId(<EntityReference>this.message.actor).toString()

    if (await messageStorage.exists()) {
      console.log('Already Following')
      return this.resp.success204('Already following')
    }

    // Create the follow.
    // TODO: Use the correct URL.
    const url = new TextEncoder().encode('https://test.example')
    const guid = uuid.generate(NAMESPACE_URL, url)
    const success = await messageStorage.save(guid)
    if (success) {
      const _acceptRequest: AP.Accept = {
        '@context': 'https://www.w3.org/ns/activitystreams',
        id: new URL(`${this.env.url.toString()}${this.username}#${guid}`),
        type: 'Accept',
        actor: new URL(`${this.env.url.toString()}${this.username}`) as EntityReference,
        object: this.message.id,
      }
    }

    /* TODO: Finish up
    const actorInbox = actorInformation.inbox as URL
    console.log('sending follow accept:', actorInbox, acceptRequest)
    const response = await this.sendSignedRequest(actorInbox, acceptRequest)
    console.log('Following result', response.status, response.statusText, await response.text())
    // Check response.status
    */
    return this.resp.error500()
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
      return this.resp.error422('No object ID')
    }

    if (this.message.object === null) {
      return this.resp.error422('No object to undo')
    }

    const object = this.kdb.getDocument(this.message.object)

    if (object === undefined) {
      return this.resp.error422('No actor')
    }

    if (!('actor' in object)) {
      return this.resp.error422('No actor')
    }

    if (!('object' in object)) {
      return this.resp.error422('No object to act upon')
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
        return this.resp.error422(`Cannot undo a ${type} object`)
      }
    }

    // TODO: Handle `success` better.
    return success ? this.resp.success202('Handled Undo') : this.resp.error500()
  }
}
