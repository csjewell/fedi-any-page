/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import {
  type App, createApp, createRouter, eventHandler, type H3Event,
  useBase,
} from 'h3'
import { useCompressionStream } from 'h3-compression'
import { Keyv } from 'keyv'
import { SQLiteConfig } from '@csjewell-activitypub/database-better-sqlite'
import { Server } from '@csjewell-activitypub/general'
import { HTML, NodeInfo, WebFinger } from '@csjewell-activitypub/handlers-response'
import KeyvSqlite from '@keyv/sqlite'
import { H3Request } from './request.ts'
import { H3RespHelper } from './response.ts'
import { sessionOptions } from './sessionOptions.ts'

/**
 * Class that implements the server routing.
 * @class
 */
export class H3Server {
  private config : SQLiteConfig
  private app    : App

  constructor(dbLocation: string, isTest: boolean) {
    this.app = createApp({ onBeforeResponse: useCompressionStream, })

    const kvStore = new KeyvSqlite(`sqlite:/${ dbLocation }`)
    const kvCache = new Keyv<string>({ store: kvStore, ttl: 28800, })

    this.config = new SQLiteConfig(kvCache, './h3.server.db')

    const sessionOpts = sessionOptions(isTest)
    const req = async (e: H3Event): Promise<H3Request> => {
      const r = new H3Request(e, sessionOpts)

      await r.init()
      return r
    }

    const htmlResp = async (e: H3Event): Promise<H3RespHelper> => {
      const p = new H3RespHelper(isTest, e, sessionOpts)

      await p.init()
      return p
    }

    const apiRouter = createRouter()

    apiRouter.post(
      '/login',
      eventHandler(async (event: H3Event): Promise<Response> => {
        return await Server.RePliers.Auth.Login(
          this.config, await req(event), await htmlResp(event),
        )
      }),
    )

    apiRouter.post(
      '/verify',
      eventHandler(async (event: H3Event): Promise<Response> => {
        return await Server.RePliers.Auth.Verify(
          this.config, await req(event), await htmlResp(event),
        )
      }),
    )

    apiRouter.post(
      '/logout',
      eventHandler(async (event: H3Event): Promise<Response> => {
        return await Server.RePliers.Auth.Logout(
          this.config, await req(event), await htmlResp(event),
        )
      }),
    )

    const baseRouter = createRouter()

    baseRouter.use('/re-pliers-api/**', useBase('/re-pliers-api', apiRouter.handler))

    baseRouter.get(
      '/favicon.ico',
      eventHandler((_event: H3Event): Response => {
        return HTML.success204()
      }),
    )

    baseRouter.get(
      '/setup',
      eventHandler(async (event: H3Event): Promise<Response> => {
        return Server.Setup.Get(await htmlResp(event))
      }),
    )

    baseRouter.post(
      '/setup',
      eventHandler(async (event: H3Event): Promise<Response> => {
        return Server.Setup.Post(await htmlResp(event))
      }),
    )

    baseRouter.options(
      '/setup',
      eventHandler(async (event: H3Event): Promise<Response> => {
        return Server.Setup.Options(await htmlResp(event))
      }),
    )

    const wkRouter = createRouter()

    wkRouter.get(
      '/webfinger',
      eventHandler(async (event: H3Event): Promise<Response> => {
        return await Server.WebFinger(
          this.config, await req(event), WebFinger,
        )
      }),
    )

    wkRouter.options(
      '/webfinger',
      eventHandler((_event: H3Event): Response => {
        return WebFinger.options204()
      }),
    )

    wkRouter.get(
      '/nodeinfo',
      eventHandler(async (event: H3Event): Promise<Response> => {
        return await Server.NodeInfo(
          this.config, await req(event), NodeInfo,
        )
      }),
    )

    wkRouter.options(
      '/nodeinfo',
      eventHandler((_event: H3Event): Response => {
        return NodeInfo.options204()
      }),
    )

    wkRouter.get(
      '/nodeinfo/2.1',
      eventHandler(async (event: H3Event): Promise<Response> => {
        return await Server.NodeInfo21(
          this.config, await req(event), NodeInfo,
        )
      }),
    )

    wkRouter.options(
      '/nodeinfo/2.1',
      eventHandler((_event: H3Event): Response => {
        return HTML.options204()
      }),
    )


    baseRouter.use('/.well-known/**', useBase('/.well-known', wkRouter.handler))

    this.app.use(baseRouter)


    /*
    router.options('/.well-known/webfinger', (ctx) => ctx.response.with(Resp.WebFinger.options204() as Response))
    router.options('/.well-known/nodeinfo', (ctx) => ctx.response.with(Resp.NodeInfo.options204() as Response))
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
