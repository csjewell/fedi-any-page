import type * as Kit from './interfaces.ts'

export function GetHandler(resp: Kit.Responses, config: Kit.Configuration): unknown {
  return resp.success200Obj({
    body: {
      links: [{
        rel: 'http://nodeinfo.diaspora.software/ns/schema/2.1',
        href: `${config.url.toString()}nodeinfo/2.1`,
      }],
    },
  })
}

// TODO: This should read the usage data from the database
export function GetHandler21(resp: Kit.Responses, config: Kit.Configuration): unknown {
  return resp.success200Obj({
    body: {
      version: '2.1',
      software: {
        name: 'Fedipage-kit',
        repository: 'https://github.com/csjewell/activitypage-ts-kit/',
        homepage: 'https://csjewell.github.io/activitypage-ts-kit/',
        version: 'v0.1.0',
      },
      protocols: [
        'activitypub',
      ],
      services: {
        inbound: ['rss2.0'],
        outbound: ['rss2.0'],
      },
      openRegistrations: false,
      usage: {
        users: {
          total: 1,
          activeHalfyear: 1,
          activeMonth: 1,
        },
      },
      metadata: {
        nodeName: config.siteName,
      },
    },
  })
}
