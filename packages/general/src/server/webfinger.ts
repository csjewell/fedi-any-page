/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import type { Configuration } from '../configuration.ts'
import type * as Request from '../request.ts'
import type { Type as Responses } from '../responses.ts'
import type { User } from '../users.ts'
import type { APIHandler } from './types.ts'

type FingerHandlerServer = (account: string) => Record<string, unknown>

type FingerHandlerMastodon = <DatabaseT>(
  account: string,
  config: Configuration<DatabaseT>,
) => Record<string, unknown>

type FingerHandlerUser = <DatabaseT>(
  account: string,
  config: Configuration<DatabaseT>,
  user: User,
) => Record<string, unknown>

const fingerServer: FingerHandlerServer = (account: string): Record<string, unknown> => {
  return {
    subject : account,
    links   : [
      {
        rel  : 'https://www.w3.org/ns/activitystreams#Service',
        type : 'application/activity+json',
        href : `"${ account }activitypub/server`,
      },
    ],
  }
}

const fingerServerMastodon: FingerHandlerMastodon = <DatabaseT>(
  account : string,
  config  : Configuration<DatabaseT>,
): Record<string, unknown> => {
  return {
    subject : account,
    links   : [
      {
        rel  : 'https://www.w3.org/ns/activitystreams#Service',
        type : 'application/activity+json',
        href : `"${ config.url.toString() }activitypub/server`,
      },
    ],
  }
}

const fingerUser: FingerHandlerUser = <DatabaseT>(
  account: string,
  config: Configuration<DatabaseT>,
  user: User,
): Record<string, unknown> => {
  const returnValue = {
    subject : account.toLowerCase(),
    links   : [
      {
        rel  : 'self',
        type : 'application/activity+json',
        href : `"${ config.url.toString() }activitypub/user/${ user.username ?? '' }"`,
      },
    ],
  } as Record<string, unknown>

  if ('aliases' in user) {
    returnValue.aliases = user.aliases
  }

  if ('homepage' in user && typeof user.homepage === 'string' && user.homepage !== '') {
    (returnValue.links as Array<Record<string, string>>).push({
      rel  : 'me',
      href : user.homepage,
    })
  }

  if ('dId' in user && user.dId !== undefined) {
    (returnValue.links as Array<Record<string, string>>).push({
      rel  : 'self',
      type : 'application/did+ld+json',
      href : `at://${ user.dId }`,
    })
  }

  return returnValue
}

/**
 * Handles web queries to the /.well-known/webfinger?resource=... URL.
 *
 * See https://docs.joinmastodon.org/spec/webfinger/ ,
 * https://datatracker.ietf.org/doc/rfc7033/ , and
 * https://codeberg.org/fediverse/fep/src/branch/main/fep/d556/fep-d556.md
 * for more information.
 *
 * @param config An object implementing Configuration
 * @param req An object implementing Request.Helper
 * @param resp An object implementing Responses
 * @returns ResponseT An appropriate response to the request
 */
export const WebFinger: APIHandler = async <DatabaseT, ResponseT>(
  config: Configuration<DatabaseT>,
  req: Request.Helper,
  resp: Responses<ResponseT>,
): Promise<ResponseT> => {
  const { url, } = req
  const { users, } = config.database

  const params = url.searchParams

  if (!params.has('resource')) {
    return resp.error404({ info: 'Resource', additional: 'no resource key', })
  }

  const account = params.get('resource') ?? ''

  if (account === '') {
    return resp.error404({ info: 'Resource', additional: 'no resource value', })
  }

  let isServerActor = false
  let isServerActorMastodon = false

  if (account.startsWith('acct:')) {
    const serverActor = config.url.hostname.toLowerCase()

    // This (and the webFingerServerMastodon routine) handles Mastodon's equivalent of FEP-d556
    if (account === `acct:${ serverActor }@${ serverActor }`) {
      isServerActorMastodon = true
    }
  } else {
    // This (and the webFingerServer routine) provide FEP-d556
    const serverActorURL = config.url

    serverActorURL.hash = ''
    serverActorURL.search = ''
    serverActorURL.protocol = serverActorURL.protocol.toLowerCase()
    serverActorURL.hostname = serverActorURL.hostname.toLowerCase()

    let serverActor = serverActorURL.href

    if (!serverActor.endsWith('/')) {
      serverActor = `${ serverActor }/`
    }

    if (account === serverActor) {
      isServerActor = true
    } else {
      return resp.error404({ info: 'Resource', additional: 'wrong scheme to test', })
    }
  }

  if (!isServerActor && !isServerActorMastodon) {
    const apDomain = `@${ config.url.hostname.toLowerCase() }`
    const matchloc = account.indexOf(apDomain)

    if (matchloc === -1) {
      return resp.error404({ info: 'Resource', additional: 'testing against wrong domain?', })
    }

    const username = account.slice(5, matchloc)
    const user = await users().retrieveUser(username)

    if (user === undefined) {
      return resp.error404({ info: 'Resource', additional: 'No user by that name?', })
    }

    return resp.success200Obj({ body: fingerUser(account, config, user), })
  }

  const returnValue = isServerActor ? fingerServer(account) : fingerServerMastodon(account, config)

  return resp.success200Obj({ body: returnValue, })
}

