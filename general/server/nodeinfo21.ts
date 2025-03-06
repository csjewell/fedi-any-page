import type Responses from '../responses.ts'
import type Configuration from '../configuration.ts'

// TODO: This should read the usage data from the database
export default function NodeInfo21(resp: Responses, config: Configuration): unknown {
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
