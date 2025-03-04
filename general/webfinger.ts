import type * as Kit from './interfaces.ts'
import type { User, Users } from './users.ts'

export function GetHandler(url: URL, users: Users, resp: Kit.Responses, config: Kit.Configuration): unknown {
  const params = url.searchParams

  if (params.has('resource') === undefined) {
    return resp.error404({ info: 'Resource', additional: 'no resource key' })
  }

  const account = params.get('resource') ?? ''
  if (account === '') {
    return resp.error404({ info: 'Resource', additional: 'no resource value' })
  }

  let isServerActor = false
  let isServerActorMastodon = false

  if (account.substring(0, 5) === 'acct:') {
    const serverActor = config.url.hostname.toLowerCase()
    // This (and the webFingerServerMastodon routine) handles Mastodon's equivalent of FEP-d556
    if (account === `acct:${serverActor}@${serverActor}`) {
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
      serverActor = serverActor.concat('/')
    }

    if (account === serverActor) {
      isServerActor = true
    } else {
      return resp.error404({ info: 'Resource', additional: 'wrong scheme to test' })
    }
  }

  if (!isServerActor && !isServerActorMastodon) {
    const apDomain = `@${config.url.hostname.toLowerCase()}`
    const matchloc = account.indexOf(apDomain)
    if (matchloc === null) {
      return resp.error404({ info: 'Resource', additional: 'testing against wrong domain?' })
    }

    const username = account.substring(5, matchloc)
    const user = users.retrieveUser(username)
    if (user === undefined) {
      return resp.error404({ info: 'Resource', additional: 'No user by that name?' })
    }

    return resp.success200Obj({ body: User(account, user, config) })
  }

  const returnValue = isServerActor ? Server(account) : ServerMastodon(account, config)
  return resp.success200Obj({ body: returnValue })
}

function Server(account: string): Record<string, unknown> {
  return {
    subject: account,
    links: [{
      rel: 'https://www.w3.org/ns/activitystreams#Service',
      type: 'application/activity+json',
      href: `"${account}activitypub/server`,
    }],
  } as Record<string, unknown>
}

function ServerMastodon(account: string, config: Kit.Configuration): Record<string, unknown> {
  return {
    subject: account,
    links: [{
      rel: 'https://www.w3.org/ns/activitystreams#Service',
      type: 'application/activity+json',
      href: `"${config.url.toString()}activitypub/server`,
    }],
  } as Record<string, unknown>
}

function User(account: string, user: User, config: Kit.Configuration): Record<string, unknown> {
  const returnValue = {
    subject: account.toLowerCase(),
    links: [{
      rel: 'self',
      type: 'application/activity+json',
      href: `"${config.url.toString()}activitypub/user/${user.username}"`,
    }],
  } as Record<string, unknown>

  if ('aliases' in user) {
    returnValue.aliases = user.aliases
  }

  if (('homepage' in user) && (typeof user.homepage === 'string') && (user.homepage !== '')) {
    ;(returnValue.links as Array<Record<string, string>>).push({
      rel: 'me',
      href: user.homepage,
    })
  }

  if ('dId' in user) {
    ;(returnValue.links as Array<Record<string, string>>).push({
      rel: 'self',
      type: 'application/did+ld+json',
      href: `at://${user.dId}`,
    })
  }

  return returnValue
}
