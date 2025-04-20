/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { html } from 'htm/preact'
import type { FunctionComponent } from 'preact'

/**
 * Displays the information about the Fediverse.
 *
 * @param isOpen - Is the Info open?
 * @param user - The user that created this page.
 * @param domain - The domain to follow the user at.
 * @returns A FunctionComponent, to be consumed by JSX or HTM.
 */
const Info: FunctionComponent<{
  isOpen : boolean
  user   : number
  domain : string
}> = ({ isOpen, user, domain, }) => {
  // This is because otherwise, I get run-on phrases.
  const infoText = [
    html`Replies and Likes here are federated from people who follow this blog on `,
    html`servers (called <q>instances</q>) that run `,
    html`<a href="https://soapbox.pub/servers/">Ditto</a>, `,
    html`<a href="https://www.joinmastodon.org/servers/">Mastodon</a>, `,
    html`<a href="https://www.misskey-hub.net/en/servers/">MissKey</a>, `,
    html`<a href="https://pleroma.social/#featured-instances">Pleroma</a>, `,
    html`<a href="https://akkoma.social/#join">Akkoma</a>, and other software that `,
    html`provides ActivityPub federation - otherwise known as the `,
    html`<a href="https://en.wikipedia.org/wiki/Fediverse">Fediverse</a>. If you `,
    html`wish to reply to this post, sign up on an instance (or `,
    html`<a href="https://runyourown.social/">start one if you would like</a>) and `,
    html`follow @${ user }@${ domain } from your account. You reply `,
    html`on your own instance, and it should show up here. You can also search for `,
    html`instances at <a href="https://fedidb.org/">FediDB</a> or `,
    html`<a href="https://fediverse.party/">Fediverse.party</a>.`,
  ]

  return html`
    <p class="info" style=${ { display: isOpen ? 'block' : 'none', } }>
      ${ infoText }
    </p>
  `
}

/* eslint-disable-next-line import-x/no-default-export */
export default Info
