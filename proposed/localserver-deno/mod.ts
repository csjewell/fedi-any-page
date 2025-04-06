/// <reference types="@types/deno" preserve="true" />
/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { Application } from '@oak/oak/application'
import { Router } from '@oak/oak/router'
import * as Server from '../general/server/mod.ts'
import { Users } from '../general/users.ts'
import * as Resp from '../handlers-response/mod.ts'
import { Config } from './configuration.ts'

const testUsers = new Users({
  '**' : {
    fullname : 'Server Actor',
  },
  'testuser1' : {
    fullname : 'Test1 User',
  },
  'testuser2' : {
    fullname : 'Test2 User',
  },
})

const status1: Deno.PermissionStatus = await Deno.permissions.request({ name: 'read', path: '.', } as const)

if (status1.state !== 'granted') {
  // Barf!
}

const status2: Deno.PermissionStatus = await Deno.permissions.request({ name: 'net', } as const)

if (status2.state !== 'granted') {
  // Barf!
}

const router: Router = new Router()

router.get('/favicon.ico', ctx => ctx.response.with(Resp.HTML.success204()))
router.get('/setup', ctx => ctx.response.with(Server.Setup.Get(Resp.HTML) as Response))
router.post('/setup', ctx => ctx.response.with(Server.Setup.Post(Resp.HTML) as Response))
router.options('/setup', ctx => ctx.response.with(Server.Setup.Options(Resp.HTML) as Response))
router.get(
  '/.well-known/webfinger',
  ctx => ctx.response.with(Server.WebFinger(ctx.request.url, testUsers, Resp.WebFinger, Config) as Response),
)
router.options('/.well-known/webfinger', ctx => ctx.response.with(Resp.WebFinger.options204()))
router.get(
  '/.well-known/nodeinfo',
  ctx => ctx.response.with(Server.NodeInfo(Resp.NodeInfo, Config) as Response),
)
router.options('/.well-known/nodeinfo', ctx => ctx.response.with(Resp.NodeInfo.options204()))
router.get('/nodeinfo/2.1', ctx => ctx.response.with(Server.NodeInfo21(Resp.NodeInfo, Config) as Response))
router.options('/nodeinfo/2.1', ctx => ctx.response.with(Resp.NodeInfo.options204()))
//router.get('/activitypub/server', (ctx) => ctx.response.with(Server.App.Index(config, null, Resp.ActivityPub) as Response))
router.options('/activitypub/server', ctx => ctx.response.with(Resp.ActivityPub.options204()))
// router.get('/activitypub/server/inbox', (ctx) => ctx.response.with(Server.App.Inbox(Resp.ActivityPub) as Response))
router.options('/activitypub/server/inbox', ctx => ctx.response.with(Resp.ActivityPub.options204()))
// router.get('/activitypub/server/outbox', (ctx) => ctx.response.with(Server.App.Outbox(Resp.ActivityPub) as Response))
router.options('/activitypub/server/outbox', ctx => ctx.response.with(Resp.ActivityPub.options204()))
// router.post('/re-pliers-api/login', (ctx) => ctx.response.with(Server.Api.Outbox(Resp.ActivityPub) as Response))
router.options('/re-pliers-api/login', ctx => ctx.response.with(Resp.ActivityPub.options204()))
// router.get('/re-pliers-api/verify', (ctx) => ctx.response.with(Server.Api.Outbox(Resp.HTML) as Response))
router.options('/re-pliers-api/verify', ctx => ctx.response.with(Resp.ActivityPub.options204()))
// router.post('/re-pliers-api/logout', (ctx) => ctx.response.with(Server.Api.Outbox(Resp.HTML) as Response))
router.options('/re-pliers-api/logout', ctx => ctx.response.with(Resp.ActivityPub.options204()))
// router.post('/re-pliers-api/replies', (ctx) => ctx.response.with(Server.Api.Outbox(Resp.HTML) as Response))
router.options('/re-pliers-api/replies', ctx => ctx.response.with(Resp.ActivityPub.options204()))
// router.post('/re-pliers-api/reply', (ctx) => ctx.response.with(Server.Api.Outbox(Resp.HTML) as Response))
router.options('/re-pliers-api/reply', ctx => ctx.response.with(Resp.ActivityPub.options204()))
// router.post('/re-pliers-api/reply/like', (ctx) => ctx.response.with(Server.Api.Outbox(Resp.HTML) as Response))
router.options('/re-pliers-api/reply/like', ctx => ctx.response.with(Resp.ActivityPub.options204()))
// router.post('/re-pliers-api/reply/unlike', (ctx) => ctx.response.with(Server.Api.Outbox(Resp.HTML) as Response))
router.options('/re-pliers-api/reply/unlike', ctx => ctx.response.with(Resp.ActivityPub.options204()))
// router.post('/re-pliers-api/reply/hide', (ctx) => ctx.response.with(Server.Api.Outbox(Resp.HTML) as Response))
router.options('/re-pliers-api/reply/hide', ctx => ctx.response.with(Resp.ActivityPub.options204()))
// router.post('/re-pliers-api/reply/unhide', (ctx) => ctx.response.with(Server.Api.Outbox(Resp.HTML) as Response))
router.options('/re-pliers-api/reply/unhide', ctx => ctx.response.with(Resp.ActivityPub.options204()))

/*

src/components/AuthAPI.ts:34:  const api = `${ (new URL(page)).origin }/re-pliers-api`
src/components/AuthAPI.ts:37:    fetch(`${api}/login`, {
src/components/AuthAPI.ts:101:    fetch(`${api}/verify`, {
src/components/AuthAPI.ts:129:    fetch(`${api}/logout`, {
src/components/RepliesAPI.ts:58:  const api = `${ (new URL(page)).origin }/re-pliers-api`
src/components/RepliesAPI.ts:62:    fetch(`${api}/reply`, {
src/components/RepliesAPI.ts:90:    fetch(`${api}/reply/${action}`, {
src/components/RepliesAPI.ts:120:    fetch(`${api}/replies`, {

*/

const app = new Application()

app.use(router.routes())
app.use(router.allowedMethods())

app.listen({ port: 8080, })
