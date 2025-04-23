/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { format } from 'node:util'
import RemarkLinkRewrite from 'remark-link-rewrite'

export default function remarkCustom() {
  return RemarkLinkRewrite({
    replacer : (url) => {
      const u = new URL(format('%s', url))

      if (u.pathname.endsWith('-internal-.md')) {
        u.pathname = `${ u.pathname.slice(0, Math.max(0, u.pathname.length - 13)) }_internal/`
        return u.toString()
      }
      if (u.pathname.endsWith('.md')) {
        u.pathname = `${ u.pathname.slice(0, Math.max(0, u.pathname.length - 3)) }/`
        return u.toString()
      }

      return u.toString()
    },
  })
}
