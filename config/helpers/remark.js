/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import RemarkLinkRewrite from 'remark-link-rewrite'

export default function remarkCustom() {
  return RemarkLinkRewrite({
    replacer: async (url) => {
      const u = new URL(url)
      if (u.pathname.endsWith('-internal-.md')) {
        u.pathname = `${u.pathname.substring(0, u.pathname.length - 13)}_internal/`
        return u.toString()
      }
      if (u.pathname.endsWith('.md')) {
        u.pathname = `${ u.pathname.substring(0, u.pathname.length - 3) }/`
        return u.toString()
      }
      return url
    },
  })
}
