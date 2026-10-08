<!--
@license
Copyright (c) Audanika. All Rights Reserved.

Use of this source code is governed by terms that can be
found in the LICENSE file in the root of this package.
-->

# audaudio.github.io

The documentation website of the Audanika Audio Engine, built with
[Astro](https://astro.build) and [Starlight](https://starlight.astro.build)
and published at [audaudio.github.io](https://audaudio.github.io).

Created from [rljson.github.io](https://github.com/rljson/rljson.github.io):
the same stack, layout and rules. The Snippet component shows regions of
tested files; the tests of the pages follow with the first content.

## Content

| Path                           | Purpose                               |
| ------------------------------ | ------------------------------------- |
| `src/content/docs/index.mdx`   | Landing page                          |
| `src/content/docs/overview.md` | Overview                              |
| `src/components/Snippet.astro` | Shows a region of a tested file       |
| `src/snippets/`                | Extracts a region from a file         |
| `src/styles/audanika.css`      | Theme                                 |
| `public/`                      | Favicon and touch icon (placeholders) |
| `astro.config.mjs`             | Site title, social links and sidebar  |

## Commands

| Command        | Action                                   |
| -------------- | ---------------------------------------- |
| `pnpm install` | Install the dependencies                 |
| `pnpm dev`     | Start the dev server at `localhost:4321` |
| `pnpm build`   | Run the tests and build to `./dist/`     |
| `pnpm preview` | Preview the build locally                |
| `pnpm test`    | Run the tests and `astro check`          |
| `pnpm format`  | Format the sources with Prettier         |
