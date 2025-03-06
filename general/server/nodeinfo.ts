import type Responses from '../responses.ts'
import type Configuration from '../configuration.ts'

export default function NodeInfo(resp: Responses, config: Configuration): unknown {
  return resp.success200Obj({
    body: {
      links: [{
        rel: 'http://nodeinfo.diaspora.software/ns/schema/2.1',
        href: `${config.url.toString()}nodeinfo/2.1`,
      }],
    },
  })
}
