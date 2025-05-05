/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import {
  type App, createApp, createRouter, defineEventHandler, type H3Event,
  useBase,
} from 'h3'
import { useCompressionStream } from 'h3-compression'
import { Keyv } from 'keyv'
import { Server } from '@csjewell-activitypub/general'
import { HTML } from '@csjewell-activitypub/handlers-response'
import KeyvSqlite from '@keyv/sqlite'
import { TestConfig } from './configuration.ts'
import { H3Request } from './request.ts'
import { H3RespHelper } from './response.ts'
import { sessionOptions } from './sessionOptions.ts'

/**
 * Class that implements the server routing.
 * @class
 */
export class H3Server {
  private config : TestConfig
  private app    : App

  constructor(dbLocation: string, isTest: boolean) {
    this.app = createApp({ onBeforeResponse: useCompressionStream, })

    const kvStore = new KeyvSqlite(`sqlite:/${ dbLocation }`)
    const kvCache = new Keyv<string>({ store: kvStore, ttl: 28800, })

    this.config = new TestConfig(kvCache)

    const sessionOpts = sessionOptions(isTest)
    const req = async (e: H3Event): Promise<H3Request> => {
      const r = new H3Request(e, sessionOpts)

      await r.init()
      return r
    }
    const resp = async (e: H3Event): Promise<H3RespHelper> => {
      const p = new H3RespHelper(isTest, e, sessionOpts)

      await p.init()
      return p
    }

    const apiRouter = createRouter()

    apiRouter.post(
      '/login',
      defineEventHandler(async (event: H3Event): Promise<Response> => {
        return await Server.RePliers.Auth.Login(
          this.config, await req(event), await resp(event),
        )
      }),
    )

    apiRouter.post(
      '/verify',
      defineEventHandler(async (event: H3Event): Promise<Response> => {
        return await Server.RePliers.Auth.Verify(
          this.config, await req(event), await resp(event),
        )
      }),
    )

    apiRouter.post(
      '/logout',
      defineEventHandler(async (event: H3Event): Promise<Response> => {
        return await Server.RePliers.Auth.Logout(
          this.config, await req(event), await resp(event),
        )
      }),
    )

    const baseRouter = createRouter()

    baseRouter.use('/re-pliers-api/**', useBase('/re-pliers-api', apiRouter.handler))

    baseRouter.get(
      '/favicon.ico',
      defineEventHandler((_event: H3Event): Response => {
        return HTML.success204()
      }),
    )

    this.app.use(baseRouter)


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

  getApp = (): App => this.app
}
