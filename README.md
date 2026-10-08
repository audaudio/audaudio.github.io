<!--
@license
Copyright (c) Audanika. All Rights Reserved.

Use of this source code is governed by terms that can be
found in the LICENSE file in the root of this package.
-->

# audaudio.github.io

[audaudio.github.io](https://audaudio.github.io) documents the Audanika
Audio Engine: a Flutter audio engine with signal-flow graphs defined in
Dart and rendered in C++ on iOS, Android, macOS, Windows, Linux and Web.

This README mirrors the site. Its text comes from the pages in
`src/content/docs`, as `AGENTS.md` prescribes.

## What it is

- **Dart defines, C++ renders.** The graph, its parameters and events are
  Dart objects; every edit compiles into a render program that the C++
  engine adopts at the next block boundary.
- **Six platforms.** iOS and Android first, then macOS, Windows, Linux and
  the Web through WebAssembly in an AudioWorklet.
- **A family of packages.** Engine, audio IO, DSP nodes, sequencer, UI
  widgets and plugin shells, one repo each, all MIT.
- **Planned in the open.** Decisions, architecture and the ticket plan live
  in the project management repo
  [aud_audio_pm](https://github.com/audaudio/aud_audio_pm).

## Overview

The Audanika Audio Engine (`aud_audio`) is a family of Dart packages for
Flutter apps: a signal-flow graph defined in Dart and rendered in C++,
audio IO per platform, DSP nodes, a sequencer, UI widgets and plugin
shells.

This site is being built. The plan, the decisions and the architecture
are in the project management repo
[aud_audio_pm](https://github.com/audaudio/aud_audio_pm); the packages
live in the GitHub organization [audaudio](https://github.com/audaudio).

## Pages

| Page                                             | Source                         |
| ------------------------------------------------ | ------------------------------ |
| [Start](https://audaudio.github.io/)             | `src/content/docs/index.mdx`   |
| [Overview](https://audaudio.github.io/overview/) | `src/content/docs/overview.md` |

## Run the site

| Command        | Action                                   |
| -------------- | ---------------------------------------- |
| `pnpm install` | Install the dependencies                 |
| `pnpm dev`     | Start the dev server at `localhost:4321` |
| `pnpm build`   | Run the tests and build to `./dist/`     |
| `pnpm test`    | Run the tests and `astro check`          |

The site is deployed by `.github/workflows/deploy.yml` on every push to
`main`; `node scripts/check-pages-source.js --fix` keeps the Pages source
on GitHub Actions.
