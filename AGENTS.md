## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Code snippets

Code on the pages comes from tests. Never write a code block into a page
by hand. Add a region to the page's spec in
`test/content/docs/` and show it with `<Snippet>`, as described in the
README.

## README

The README rules the DNA layers carry — the README guide and its template —
do not apply to this repo. `README.md` mirrors the documentation: its text
comes from the pages in `src/content/docs`, today the landing page
`index.mdx` and `overview.md`, never from the README template. When a page
changes, carry the change into the README; never write README content the
site does not have. Only the short section on running the site is the
README's own.

## Deployment

GitHub Pages serves the artifact of `.github/workflows/deploy.yml`; the
Pages source must stay "GitHub Actions". A source set back to the branch
build lets Jekyll publish the README instead of the site. The deploy
workflow runs `node scripts/check-pages-source.js --fix` before the
build; run it by hand when the main page shows the README.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
