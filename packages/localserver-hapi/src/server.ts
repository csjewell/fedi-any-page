#!/usr/bin/env node
/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import Brok from 'brok'
import { Keyv } from 'keyv'
import { Server } from '@csjewell-activitypub/general'
import Hapi from '@hapi/hapi'
import KeyvSqlite from '@snomiao/keyv-sqlite'
import { TestConfig } from './configuration.ts'
import { HAPIRequest } from './request.ts'
import { HAPIResponses } from './responses.ts'
// import LocalDB from './database.ts'

const reqh = (req: Hapi.Request): HAPIRequest => new HAPIRequest(req)
const resp = (h: Hapi.ResponseToolkit): HAPIResponses => new HAPIResponses(h)

/**
 * Class that implements the server routing.
 * @class
 */
export class HAPIServer {
  private config           : TestConfig
  private server           : Hapi.Server
  private readonly getOpts : Hapi.RouteOptions = {
    state : { parse: true, },
    cors  : {
      origin                   : ['http://localhost:5173'],
      maxAge                   : 86400 * 3,
      additionalExposedHeaders : ['X-Clacks-Overhead'],
      credentials              : true,
      preflightStatusCode      : 204,
    },
  }
  private readonly postOpts : Hapi.RouteOptions = {
    payload : { parse: true, },
    state   : this.getOpts.state,
    cors    : this.getOpts.cors,
  }

  constructor(dbLocation: string, isTest: boolean) {
    const kvStore = new KeyvSqlite(dbLocation)
    const kvCache = new Keyv<string>({ store: kvStore, ttl: 28800, })

    this.config = new TestConfig(kvCache)

    this.server = Hapi.server({
      host        : 'localhost',
      port        : 5172,
      compression : { minBytes: 1, },
    })

    this.server.state('actinf', {
      // TTL in milliseconds.. null means when browser is closed.
      ttl          : 14400000,
      isSecure     : !isTest,
      isHttpOnly   : false,
      encoding     : 'base64json',
      clearInvalid : true,
      strictHeader : true,
    })

    this.server.state('actinfo', {
      // TTL in milliseconds.. null means when browser is closed.
      ttl          : 14400000,
      isSecure     : !isTest,
      isHttpOnly   : true,
      encoding     : 'iron',
      clearInvalid : true,
      strictHeader : true,
      password     : 'I saw the sign. Life is demanding, without understanding...',
      iron         : {
        encryption : {
          algorithm         : 'aes-128-ctr',
          saltBits          : 256,
          iterations        : 1,
          minPasswordlength : 32,
        },
        integrity : {
          algorithm         : 'sha256',
          saltBits          : 256,
          iterations        : 1,
          minPasswordlength : 32,
        },
        ttl                 : 0,
        localtimeOffsetMsec : 0,
        timestampSkewSec    : 120,
      },
    })

    this.server.route({
      method  : 'POST',
      path    : '/re-pliers-api/login',
      options : this.postOpts,
      handler : async (req: Hapi.Request, h: Hapi.ResponseToolkit): Promise<Hapi.ResponseObject> => {
        return await Server.RePliers.Auth.Login(this.config, reqh(req), resp(h))
      },
    })

    this.server.route({
      method  : 'POST',
      path    : '/re-pliers-api/verify',
      options : this.postOpts,
      handler : async (req: Hapi.Request, h: Hapi.ResponseToolkit): Promise<Hapi.ResponseObject> => {
        return await Server.RePliers.Auth.Verify(this.config, reqh(req), resp(h))
      },
    })

    this.server.route({
      method  : 'POST',
      path    : '/re-pliers-api/logout',
      options : this.postOpts,
      handler : async (req: Hapi.Request, h: Hapi.ResponseToolkit): Promise<Hapi.ResponseObject> => {
        return await Server.RePliers.Auth.Logout(this.config, reqh(req), resp(h))
      },
    })

    this.server.route({
      method  : 'GET',
      path    : '/favicon.ico',
      options : this.getOpts,
      // (ctx) => ctx.response.with(Resp.HTML.success204() as Response))
      handler : (_req: Hapi.Request, h: Hapi.ResponseToolkit): Hapi.ResponseObject => {
        return resp(h).success204()
      },
    })

    this.server.route({
      method  : 'GET',
      path    : '/setup',
      options : this.getOpts,
      handler : async (_req: Hapi.Request, h: Hapi.ResponseToolkit): Promise<Hapi.ResponseObject> => {
        return await Server.Setup.Get(resp(h))
      },
    })

    this.server.route({
      method  : 'POST',
      path    : '/setup',
      options : this.postOpts,
      handler : (_req: Hapi.Request, h: Hapi.ResponseToolkit): Hapi.ResponseObject => {
        return Server.Setup.Post(resp(h))
      },
    })

    this.server.route({
      method  : 'GET',
      path    : '/.well-known/webfinger',
      options : this.getOpts,
      handler : async (req: Hapi.Request, h: Hapi.ResponseToolkit): Promise<Hapi.ResponseObject> => {
        return await Server.WebFinger(this.config, reqh(req), resp(h))
      },
    })

    this.server.route({
      method  : 'GET',
      path    : '/.well-known/nodeinfo',
      options : this.getOpts,
      handler : async (req: Hapi.Request, h: Hapi.ResponseToolkit): Promise<Hapi.ResponseObject> => {
        return await Server.NodeInfo(this.config, reqh(req), resp(h))
      },
    })

    this.server.route({
      method  : 'GET',
      path    : '/nodeinfo/2.1',
      options : this.getOpts,
      handler : async (req: Hapi.Request, h: Hapi.ResponseToolkit): Promise<Hapi.ResponseObject> => {
        return await Server.NodeInfo21(this.config, reqh(req), resp(h))
      },
    })

    this.server.route({
      method  : 'GET',
      path    : '/activitypub/server',
      options : this.getOpts,
      handler : async (req: Hapi.Request, h: Hapi.ResponseToolkit): Promise<Hapi.ResponseObject> => {
        return await Server.App.Index(this.config, reqh(req), resp(h))
      },
    })

    /*
    // router.get('/activitypub/server/inbox', (ctx) => ctx.response.with(Server.App.Inbox(Resp.ActivityPub) as Response))
    router.options('/activitypub/server/inbox', (ctx) => ctx.response.with(Resp.ActivityPub.options204() as Response))
    // router.get('/activitypub/server/outbox', (ctx) => ctx.response.with(Server.App.Outbox(Resp.ActivityPub) as Response))
    router.options('/activitypub/server/outbox', (ctx) => ctx.response.with(Resp.ActivityPub.options204() as Response))
    // router.post('/re-pliers-api/replies', (ctx) => ctx.response.with(Server.Api.Outbox(Resp.HTML) as Response))
    router.options('/re-pliers-api/replies', (ctx) => ctx.response.with(Resp.ActivityPub.options204() as Response))
    // router.post('/re-pliers-api/reply', (ctx) => ctx.response.with(Server.Api.Outbox(Resp.HTML) as Response))
    router.options('/re-pliers-api/reply', (ctx) => ctx.response.with(Resp.ActivityPub.options204() as Response))
    // router.post('/re-pliers-api/reply/like', (ctx) => ctx.response.with(Server.Api.Outbox(Resp.HTML) as Response))
    router.options('/re-pliers-api/reply/like', (ctx) => ctx.response.with(Resp.ActivityPub.options204() as Response))
    // router.post('/re-pliers-api/reply/unlike', (ctx) => ctx.response.with(Server.Api.Outbox(Resp.HTML) as Response))
    router.options('/re-pliers-api/reply/unlike', (ctx) => ctx.response.with(Resp.ActivityPub.options204() as Response))
    // router.post('/re-pliers-api/reply/hide', (ctx) => ctx.response.with(Server.Api.Outbox(Resp.HTML) as Response))
    router.options('/re-pliers-api/reply/hide', (ctx) => ctx.response.with(Resp.ActivityPub.options204() as Response))
    // router.post('/re-pliers-api/reply/unhide', (ctx) => ctx.response.with(Server.Api.Outbox(Resp.HTML) as Response))
    router.options('/re-pliers-api/reply/unhide', (ctx) => ctx.response.with(Resp.ActivityPub.options204() as Response))

    */
  }

  /** Starts the server. */
  start = async (): Promise<void> => {
    await this.server.register({
      plugin  : Brok,
      options : {
        compress : { quality: 9, },
      },
    })
    console.info('Starting local server using @hapi/hapi at http://localhost:5172/, CTRL-C to exit')
    await this.server.start()
  }
}
