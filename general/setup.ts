import type * as Kit from './interfaces.ts'
// import './setup.html' with { type: 'text' }

export function GetHandler(resp: Kit.Responses): unknown {
  // I wish we could just uncomment the line above, but it only works in Bun as of yet.
  const body = `<!DOCTYPE html>
<html><head>
  <title>Setup for the "Fedi Any Page" toolkit</title>
</head><body>
  <h1 style="font-size: 110%">Setup for the "Fedi Any Page" toolkit</h1>
  <p>This page will generate the <code>users.json</code> file to put on your website as a site asset.</p>
  <form action="POST">
    <p><label for="jsonfile">JSON File: </label><imput type="file" id="jsonfile">(only required if you want to append to it.)</p>
    <p><label for="username">Username:  </label><input type="text" id="username">(required)</p>
    <p><label for="password">Password:  </label><input type="text" id="password">(required)</p>
    <p><label for="homepage">Homepage:  </label><input type="text" id="homepage">          </p>
    <p><label for="summary" >Summary:   </label><input type="text" id="summary">           </p>
    <input type="submit">
  </form>
</body></html>
`

  const addHeaders = {
    'Content-Type:': 'text/html',
  }
  return resp.success200Str({ body, addHeaders })
}

export function PostHandler(resp: Kit.Responses): unknown {
  return resp.error404NotImplemented()

  // Content-Disposition: attachment; filename="users.json"
}

export function OptionsHandler(resp: Kit.Responses): unknown {
  const addHeaders = {
    'Allow': 'OPTIONS, GET, HEAD, POST',
  }
  return resp.options204({ addHeaders })
}
