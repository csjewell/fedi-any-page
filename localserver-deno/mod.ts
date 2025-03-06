#!/usr/local/bin deno
/* SPDX */

import { Application } from '@oak/oak/application'
import { Router } from '@oak/oak/router'
import * as Resp from '@csjewell-activitypub/handlers-response'
import * as Kit from '@csjewell-activitypub/general'
import * as Server from '@csjewell-activitypub/general/server'
import { config } from './configuration.ts'
// import * as AP from '@csjewell-activitypub/types'

const testUsers = new Kit.Users({
  '**': {
    fullname: 'Server Actor',
  },
  'testuser1': {
    fullname: 'Test1 User',
  },
  'testuser2': {
    fullname: 'Test2 User',
  },
})

const status1 = await Deno.permissions.request({ name: 'read', path: '.' } as const)

if (status1.state !== 'granted') {
  // Barf!
}

const status2 = await Deno.permissions.request({ name: 'net' } as const)

if (status1.state !== 'granted') {
  // Barf!
}

const router = new Router()
router.get('/setup', (ctx) => ctx.response.with(Server.Setup.Get(Resp.HTML) as Response))
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

const app = new Application()
app.use(router.routes())
app.use(router.allowedMethods())

app.listen({ port: 8080 })
