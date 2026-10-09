// @ts-check
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://audaudio.github.io',
  integrations: [
    starlight({
      title: 'Audanika Audio Engine',
      description:
        'A Flutter audio engine: signal-flow graphs defined in Dart and ' +
        'rendered in C++ on iOS, Android, macOS, Windows, Linux and Web.',
      favicon: '/favicon.png',
      customCss: ['./src/styles/audanika.css'],
      // Round and outline each code frame as a whole, so titles and tabs
      // stay attached to their code.
      expressiveCode: {
        styleOverrides: {
          borderRadius: '0.5rem',
          borderColor: 'var(--sl-color-hairline-shade)',
        },
      },
      head: [
        {
          tag: 'link',
          attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'preconnect',
            href: 'https://fonts.gstatic.com',
            crossorigin: true,
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href:
              'https://fonts.googleapis.com/css2?' +
              'family=Inter+Tight:wght@500;600&' +
              'family=Inter:wght@400;500;600&' +
              'family=DM+Mono:ital@0;1&display=swap',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'apple-touch-icon',
            href: '/apple-touch-icon.png',
            sizes: '180x180',
          },
        },
      ],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/audaudio',
        },
      ],
      editLink: {
        baseUrl: 'https://github.com/audaudio/audaudio.github.io/edit/main/',
      },
      sidebar: [
        {
          label: 'Start here',
          items: [{ label: 'Overview', slug: 'overview' }],
        },
        {
          label: 'The engine',
          items: [
            { label: 'The graph', slug: 'graph' },
            { label: 'The headless host', slug: 'host' },
          ],
        },
      ],
    }),
  ],
});
