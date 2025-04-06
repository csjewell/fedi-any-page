#!/usr/bin/env node
/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import Brok from 'brok'
import { Keyv } from 'keyv'
import Hapi from '@hapi/hapi'
import KeyvSqlite from '@keyv/sqlite'
// import { RepliesAPI } from '../general/server/re-pliers-api/replies.ts'
import * as Server from '../general/server/mod.ts'
import * as AuthAPI from '../general/server/re-pliers-api/auth.ts'
import { TestConfig } from './configuration.ts'
import HAPIRequest from './request.ts'
import HAPIResponses from './responses.ts'
// import LocalDB from './database.ts'

const reqh = (req: Hapi.Request): HAPIRequest => new HAPIRequest(req)
const resp = (h: Hapi.ResponseToolkit): HAPIResponses => new HAPIResponses(h)

export default class HAPIServer {
  private config        : TestConfig
  private server        : Hapi.Server
  private readonly opts : Hapi.RouteOptions = {
    payload : { parse: true, },
    state   : { parse: true, },
    cors    : {
      origin                   : ['http://localhost:5173'],
      maxAge                   : 86400 * 3,
      additionalExposedHeaders : ['X-Clacks-Overhead'],
      credentials              : true,
      preflightStatusCode      : 204,
    },
  }

  constructor(dbLocation: string, isTest: boolean) {
    const kvStore = new KeyvSqlite(`sqlite:/${ dbLocation }`)
    const _kvCache = new Keyv<string>({ store: kvStore, ttl: 28800, })

    this.config = new TestConfig() // (new LocalDB(kvCache))

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
      // eslint-disable-next-line sonarjs/no-hardcoded-passwords
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
      options : this.opts,
      handler : async (req: Hapi.Request, h: Hapi.ResponseToolkit): Promise<Hapi.ResponseObject> => {
        return await AuthAPI.Login(this.config, reqh(req), resp(h))
      },
    })

    this.server.route({
      method  : 'POST',
      path    : '/re-pliers-api/verify',
      options : this.opts,
      handler : async (req: Hapi.Request, h: Hapi.ResponseToolkit): Promise<Hapi.ResponseObject> => {
        return await AuthAPI.Verify(this.config, reqh(req), resp(h))
      },
    })

    this.server.route({
      method  : 'POST',
      path    : '/re-pliers-api/logout',
      options : this.opts,
      handler : async (req: Hapi.Request, h: Hapi.ResponseToolkit): Promise<Hapi.ResponseObject> => {
        return await AuthAPI.Logout(this.config, reqh(req), resp(h))
      },
    })

    this.server.route({
      method  : 'GET',
      path    : '/favicon.ico',
      options : this.opts,
      // (ctx) => ctx.response.with(Resp.HTML.success204() as Response))
      handler : (_req: Hapi.Request, h: Hapi.ResponseToolkit): Hapi.ResponseObject => {
        return resp(h).success204()
      },
    })

    /*
    this.server.route({
      method  : 'GET',
      path    : '/setup',
      options : this.opts,
      // (ctx) => ctx.response.with(Server.Setup.Get(Resp.HTML) as Response))
      handler : (_req: Hapi.Request, h: Hapi.ResponseToolkit): Hapi.ResponseObject => {
        return Server.WebFinger(new URL('https://exanple.com/'), undefined, resp(h), this.config)
      },
    })
    */

    /*
    router.post('/setup', (ctx) => ctx.response.with(Server.Setup.Post(Resp.HTML) as Response))
    router.options('/setup', (ctx) => ctx.response.with(Server.Setup.Options(Resp.HTML) as Response))
    router.get(
      '/.well-known/webfinger',
      (ctx) => ctx.response.with(Server.WebFinger(ctx.request.url, testUsers, Resp.WebFinger, config) as Response),
    )
    router.options('/.well-known/webfinger', (ctx) => ctx.response.with(Resp.WebFinger.options204() as Response))
    router.get(
      '/.well-known/nodeinfo',
      (ctx) => ctx.response.with(Server.NodeInfo(Resp.NodeInfo, config) as Response),
    )
    router.options('/.well-known/nodeinfo', (ctx) => ctx.response.with(Resp.NodeInfo.options204() as Response))
    router.get('/nodeinfo/2.1', (ctx) => ctx.response.with(Server.NodeInfo21(Resp.NodeInfo, config) as Response))
    router.options('/nodeinfo/2.1', (ctx) => ctx.response.with(Resp.NodeInfo.options204() as Response))
    //router.get('/activitypub/server', (ctx) => ctx.response.with(Server.App.Index(config, null, Resp.ActivityPub) as Response))
    router.options('/activitypub/server', (ctx) => ctx.response.with(Resp.ActivityPub.options204() as Response))
    // router.get('/activitypub/server/inbox', (ctx) => ctx.response.with(Server.App.Inbox(Resp.ActivityPub) as Response))
    router.options('/activitypub/server/inbox', (ctx) => ctx.response.with(Resp.ActivityPub.options204() as Response))
    // router.get('/activitypub/server/outbox', (ctx) => ctx.response.with(Server.App.Outbox(Resp.ActivityPub) as Response))
    router.options('/activitypub/server/outbox', (ctx) => ctx.response.with(Resp.ActivityPub.options204() as Response))
    // router.post('/re-pliers-api/login', (ctx) => ctx.response.with(Server.Api.Outbox(Resp.ActivityPub) as Response))
    router.options('/re-pliers-api/login', (ctx) => ctx.response.with(Resp.ActivityPub.options204() as Response))
    // router.get('/re-pliers-api/verify', (ctx) => ctx.response.with(Server.Api.Outbox(Resp.HTML) as Response))
    router.options('/re-pliers-api/verify', (ctx) => ctx.response.with(Resp.ActivityPub.options204() as Response))
    // router.post('/re-pliers-api/logout', (ctx) => ctx.response.with(Server.Api.Outbox(Resp.HTML) as Response))
    router.options('/re-pliers-api/logout', (ctx) => ctx.response.with(Resp.ActivityPub.options204() as Response))
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

  start = async (): Promise<void> => {
    await this.server.register({
      plugin  : Brok,
      options : {
        compress : { quality: 9, },
      },
    })
    await this.server.start()
  }
}
