/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import type { Type as Responses } from '../../responses.ts'

export const setupGet = async <ResponseT>(resp: Responses<ResponseT>): Promise<ResponseT> => {
  const body = `<!DOCTYPE html>
<html><head>
  <title>Setup for the "Fedi Any Page" toolkit v0.2.0-alpha-2</title>
  <style>
    form {
      width: 60%;
      display: grid;
      grid-template-columns: 1fr 2fr 4fr 4fr
      grid-template-rows: repeat(6, min-content)
      grid-auto-flow: row;
      column-gap: 30px;
      row-gap: 4px;
      justify-items: left;
    }
    label {
      grid-column: 1;
    }
    input {
      grid-column: 2;
    }
    input#jsonfile {
      grid-column: 2 / span 2;
    }
    input#username, input#password {
      width: 60%;
    }
    input#homepage {
      justify-self: stretch;
    }
    input#summary {
      grid-column: 2 / span 2;
      justify-self: stretch;
    }
    input#createfile {
      width: 60%;
      justify-self: center;
    }
    span.column {
      grid-column: 4
    }
  </style>
</head><body>
  <h1 style="font-size: 110%">Setup for the "Fedi Any Page" toolkit v0.2.0-alpha.2</h1>
  <p>This page will generate the <code>users.json</code> file to put on your website as a site asset.</p>
  <form action="POST">
    <label for="jsonfile">Previous <code>users.json</code>: </label><input type="file" id="jsonfile"><span class="column">(only required if you want to append to it.)</span>
    <label for="username">Username:</label><input type="text" id="username"><span class="column">(required)</span>
    <label for="password">Password:</label><input type="text" id="password"><span class="column">(required)</span>
    <label for="homepage">Homepage:</label><input type="text" id="homepage">
    <label for="summary" >Summary: </label><input type="text" id="summary">
    <input id="createfile" type="submit" value="Generate file">
  </form>
</body></html>
`

  const addHeaders = {
    'Content-Type' : 'text/html',
  }

  return await resp.success200Str({ body, addHeaders, })
}

