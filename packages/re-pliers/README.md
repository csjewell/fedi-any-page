This module is used to provide a front end that blogs can use.

[![libera manifesto](https://img.shields.io/badge/libera-manifesto-lightgrey.svg)](https://liberamanifesto.com)
[![🤝 Code of Conduct: Kept](https://img.shields.io/badge/%F0%9F%A4%9D_code_of_conduct-kept-21bb42.svg)](https://git.sr.ht/~csjewell/fedi-any-page/tree/dev/item/docs/CODE_OF_CONDUCT.md)
[![📝 License: MIT](https://img.shields.io/badge/%F0%9F%93%9D_license-MIT-21bb42.svg)](https://git.sr.ht/~csjewell/fedi-any-page/tree/dev/item/LICENSES/MIT.txt)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
![💪 TypeScript: Strict](https://img.shields.io/badge/%F0%9F%92%AA_typescript-strict-21bb42.svg)
[![JSR](https://jsr.io/badges/@csjewell-activitypub/re-pliers?style=plastic)](https://jsr.io/@csjewell-activitypub/re-pliers)
[![NPM](https://img.shields.io/npm/v/%40csjewell-activitypub%2Fre-pliers.svg)](https://npmjs.com/package/@csjewell-activitypub/re-pliers)

This is a widget that can be put on blog pages to show ActivityPub replies.

It is currently being worked on heavily, but can be reviewed, especially for
appearance. That can be done because we are currently displaying a
precomposed JSON file, instead of API calls, right now.

## How it is looking

This is with some mock data as of early April 2025:

![Screenshot](assets/Re-pliers.webp "Screenshot")

## Usage

This is how the re-pliers script will eventually be put into your web pages.
It'll coordinate with the web worker that'll be set up for your blog.

```html
<!DOCTYPE html>
<html lang="en-019" data-theme="dark"><head>
  <!-- You'll need the next 6 lines, plus the 'data-theme' attribute above, within the HTML header. -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <link rel="stylesheet" href="https://esm.sh/jsr/@csjewell-activitypub/re-pliers/dist/re-pliers.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <!-- ... -->
</head><body>
  <!-- Your page content goes here, of course! -->
  <!--
    After that, you'll need to have someplace to PUT the component on your page,
    (shown as the 'div' tag below), and the short (6 lines) of script
    below that, which will show the component.

    This should work on most modern browsers released since 2018, including modern ones.
    See https://caniuse.com/es6-module for where the syntax below will work.

    The stylesheet, however, uses syntax that browsers started providing in 2023.
    https://caniuse.com/css-nesting will show you which browsers support that syntax.
  -->
  <div id="pliers"></div>
  <script type="module">
    import { showRepliers, emptyCache } from "https://esm.sh/jsr/@csjewell-activitypub/re-pliers@1.0.0?standalone";
    let cache = emptyCache; // Have the static-page generator get what the contents of this are.
    showRepliers({
      page   : 'https://activitypub.example.com/blog/entry/', // The canonical URL of the current page.
      user   : 'username', // The local username of the person creating the blog entry.
      domain : 'activitypub.example.com',  // The domain of the site.
    }, document.querySelector('#pliers'), cache); // The location on the page to put the re-pliers component within
  </script>
  <!-- ... -->
</body></html>
```

## Development

See the documentation on [how to contribute](https://fedi-any-page.curtisjewell.dev/docs/contributing/).
Thanks! 💖
