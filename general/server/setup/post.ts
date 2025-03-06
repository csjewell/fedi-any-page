import type Responses from '../../responses.ts'

export default function (resp: Responses): unknown {
  return resp.error404NotImplemented()

  // Content-Disposition: attachment; filename="users.json"
}
