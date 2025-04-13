/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
//@ ts-check
import { cwd } from 'node:process';
import { writeFileSync } from 'node:fs';
import { MarkdownPageEvent } from 'typedoc-plugin-markdown';
import { ReflectionKind } from 'typedoc';

/**
 * @param {import('typedoc-plugin-markdown').MarkdownApplication} app
 */
export function load(app) {
  let weight = 100;
  app.renderer.on(
    MarkdownPageEvent.BEGIN,
    /** @param {import('typedoc-plugin-markdown').MarkdownPageEvent} page */
    (page) => {
      /**
       * Update page.frontmatter object using information from the page model
       */
      if (page.model?.kind == ReflectionKind.Module) {
        if (page.model.packageVersion === undefined) {
          // This is the "-internal-.md" file.
          page.frontmatter = {
            title: `${ page.model.parent.name } - ${ page.model.parent.packageVersion } - internal declarations`,
            weight,
            ...page.frontmatter,
          }
        } else {
          page.frontmatter = {
            title: `${ page.model.name } - ${ page.model.packageVersion }`,
            weight,
            ...page.frontmatter,
          }
        }
      } else if (page.model.kind == ReflectionKind.Namespace) {
        let title = page.model.name
        let model = page.model.parent
        while (model.kind == ReflectionKind.Namespace) {
          title = `${ model.name } - ${ title }`
          model = model.kind
        }
        page.frontmatter = {
          title: `${page.model.name} - ${ page.model.packageVersion } - ${ title }`,
          weight,
          ...page.frontmatter,
        }
      } else if (page.model.kind == ReflectionKind.Project) {
        page.frontmatter = {
          title: `@csjewell-activitypub/`,
          weight,
          draft: true,
          ...page.frontmatter,
        }
      }
      weight = weight + 1;
    },
  );
  app.renderer.postRenderAsyncJobs.push(async (renderer) => {
    // The navigation JSON structure is available on the navigation object.
    const navigation = renderer.navigation;

    let pages = [];

    navigation.forEach((value) => pages.push({
      title : value.title,
      slug  : `${ value.title.substring(value.title.lastIndexOf('/')) }/start/`
    }));

    let out = [{
      title: 'Basics',
      pages: [{
        title: 'Overview',
      }, {
        title: 'Getting Started',
      }],
    }, {
      title: 'Beyond The Basics',
      pages: [{ title: 'Contributing' }]
    }]

    out.push({ title: 'Module Documentation', pages, })
    writeFileSync(`${ cwd() }/docsite/data/navigation.json`, JSON.stringify(out));
  });
}
