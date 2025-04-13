#!/bin/sh

rm -v content/en/docs/packages.md
rm -v content/en/docs/start.md
mv -v content/en/docs/handlers-response/-internal-.md       content/en/docs/handlers-response/_internal.md
mv -v content/en/docs/general/-internal-.md                 content/en/docs/general/_internal.md
mv -v content/en/docs/database-cloudflare-d1/-internal-.md  content/en/docs/database-cloudflare-d1/_internal.md
mv -v content/en/docs/database-mock/-internal-.md           content/en/docs/database-mock/_internal.md
mv -v content/en/docs/types/-internal-.md                   content/en/docs/types/_internal.md

