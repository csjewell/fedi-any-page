import type Responses from '../../responses.ts'

export default function (resp: Responses): unknown {
  const addHeaders = {
    'Allow': 'OPTIONS, GET, HEAD, POST',
  }
  return resp.options204({ addHeaders })
}
