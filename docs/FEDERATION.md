# Federation

## Supported federation protocols and standards

- [ActivityPub](https://www.w3.org/TR/activitypub/) (Server-to-Server)
- [WebFinger](https://webfinger.net/)
- [Http Signatures](https://datatracker.ietf.org/doc/html/draft-cavage-http-signatures)
- [NodeInfo](https://nodeinfo.diaspora.software/)

## Supported FEPs

- [FEP-f1d5: NodeInfo in Fediverse Software](https://codeberg.org/fediverse/fep/src/branch/main/fep/f1d5/fep-f1d5.md)

- [FEP-b2b8: Long-form Text](https://codeberg.org/fediverse/fep/src/branch/main/fep/b2b8/fep-b2b8.md)
  - The `source` property will have a mediaType that specifies
    Github-Flavored-Markdown, since that's the canonical content.

- [FEP-d556: Server-Level Actor Discovery Using WebFinger](https://codeberg.org/fediverse/fep/src/branch/main/fep/d556/fep-d556.md)

## Intended support before 1.0.0

- [FEP-400e: Publicly-appendable ActivityPub collections](https://codeberg.org/fediverse/fep/src/branch/main/fep/400e/fep-400e.md)

- [FEP-8fcf: Followers collection synchronization across servers](https://codeberg.org/fediverse/fep/src/branch/main/fep/8fcf/fep-8fcf.md)

- [FEP-eb48: Hashtags](https://codeberg.org/fediverse/fep/src/branch/main/fep/eb48/fep-eb48.md)
  - The tags entry in the front-matter will define what hash-tags are used in
    an article.
  - When replying happens, that will have to be worked out.

- [FEP-e965: Move Activity for Migrations and Announce Activity for Tombstone Events](https://codeberg.org/fediverse/fep/src/branch/main/fep/e965/fep-e965.md)
  <!-- markdownlint-disable-next-line no-bare-urls -->
  - We add the https://w3id.org/fep/7628 URI in @context for actors to show
    that they are active.
  - Deactivated actors also have the Tombstone type.

- [FEP-5624: Per-object reply control policies](https://codeberg.org/fediverse/fep/src/branch/main/fep/5624/fep-5624.md)
  - Articles going out are always set at as:Public for 0.2.0, and ApproveReply
    objects will be sent accordingly.
  - Choice will be given closer to 1.0.0
  - Notes/Articles coming in that are replies will have THEIR canReply keys
    obeyed once replying is possible.

- [FEP-c893: DOAP](https://codeberg.org/fediverse/fep/src/branch/main/fep/c893/fep-c893.md)

- [FEP-9091: Export Actor Service Endpoint](https://codeberg.org/fediverse/fep/src/branch/main/fep/9091/fep-9091.md)
  - This would be retrievable via a script.
  - This would support the FEP-6fcd tar file format, gzipped if it can be
    handled.

- [FEP-2c59: Discovery of a Webfinger address from an ActivityPub actor](https://codeberg.org/fediverse/fep/src/branch/main/fep/2c59/fep-2c59.md)

- [FEP-a5c5: Web Syndication Methods](https://codeberg.org/fediverse/fep/src/branch/main/fep/a5c5/fep-a5c5.md)
  - First support would be for .rss feeds for a user. Posts would be next.

- [FEP-7458: Using the replies collection](https://codeberg.org/fediverse/fep/src/branch/main/fep/7458/fep-7458.md)

- [FEP-dd4b: Quote Posts](https://codeberg.org/fediverse/fep/src/branch/main/fep/dd4b/fep-dd4b.md)

- [FEP-1311: Media Attachments](https://codeberg.org/fediverse/fep/src/branch/main/fep/d556/fep-1311.md)

- [FEP-6606: ActivityPub client to server collections addressing conventions](https://codeberg.org/fediverse/fep/src/branch/main/fep/6606/fep-6606.md)
  - ??? (might be post-1.0.0)

- [FEP-fe34: Origin-based security model](https://codeberg.org/fediverse/fep/src/branch/main/fep/fe34/fep-fe34.md)
  - (as far as things need to be implemented, at any rate.)

- [FEP-1985: Signaling how an OrderedCollection is ordered](https://codeberg.org/fediverse/fep/src/branch/main/fep/1985/fep-1985.md)

- [FEP-76ea: Conversation Threads](https://codeberg.org/fediverse/fep/src/branch/main/fep/76ea/fep-76ea.md)

- [FEP-eb22: Supported ActivityStreams types with NodeInfo](https://codeberg.org/fediverse/fep/src/branch/main/fep/eb22/fep-eb22.md)

- [FEP-7628: Move actor](https://codeberg.org/fediverse/fep/src/branch/main/fep/7628/fep-7628.md)
  - For moving out: Support sending out (push-mode) Move objects
  - For moving out: Support setting movedTo/copiedTo
  - For other people moving: Support sending out Undo(Follow) and Follow when
    Move is received.
  - Per FEP-e965, we Announce tombstoning.

## Intended support post-1.0.0

- [FEP-c0e0: Emoji reactions](https://codeberg.org/fediverse/fep/src/branch/main/fep/c0e0/fep-c0e0.md)
  - Unicode emojis are supported, but not custom ones, at least at first.
  - [Akkoma-style is allowed to be input:](https://akkoma.dev/AkkomaGang/akkoma/src/branch/develop/docs/docs/development/ap_extensions.md#emoji-reactions)

- [FEP-0499: Delivering to multiple inboxes with a multibox endpoint](https://codeberg.org/fediverse/fep/src/branch/main/fep/0499/fep-0499.md)

- [FEP-268d: Search consent signals for objects](https://codeberg.org/fediverse/fep/src/branch/main/fep/268d/fep-268d.md)

- [FEP-3b86: Activity Intents](https://codeberg.org/fediverse/fep/src/branch/main/fep/3b86/fep-3b86.md)

- [FEP-171b: Conversation Containers](https://codeberg.org/fediverse/fep/src/branch/main/fep/171b/fep-171b.md)

- [FEP-9967: Polls](https://codeberg.org/fediverse/fep/src/branch/main/fep/9967/fep-9967.md)

## Hmmm... (To think about implementing after 2.0.0)

- [FEP-f06f: Object observers](https://codeberg.org/fediverse/fep/src/branch/main/fep/f06f/fep-f06f.md)

- [FEP-f228: Backfilling conversations](https://codeberg.org/fediverse/fep/src/branch/main/fep/f228/fep-f228.md)

- [FEP-e229: Best practices for extensibility](https://codeberg.org/fediverse/fep/src/branch/main/fep/e229/fep-e229.md)

- [FEP-0391: Special collection proofs](https://codeberg.org/fediverse/fep/src/branch/main/fep/0391/fep-0391.md)

- [FEP-5e53: Opt-out Preference Signal](https://codeberg.org/fediverse/fep/src/branch/main/fep/5e53/fep-5e53.md)

- [FEP-e3e9: Actor-Relative URLs](https://codeberg.org/fediverse/fep/src/branch/main/fep/e3e9/fep-e3e9.md)

- [FEP-7952: Roadmap For Actor and Object Portability](https://codeberg.org/fediverse/fep/src/branch/main/fep/7952/fep-7952.md)

## ActivityPub

Since this integrates with static-page sites, those static pages generate
Article objects as opposed to the Note objects that microblogging services
like Mastodon create. However, we DO accept Note objects as replies to
our pages.

<!-- Describe activities and extensions. -->

## Additional documentation

<!-- Add links to documentation pages. -->
