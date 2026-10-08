/**
 * @license
 * Copyright (c) Audanika. All Rights Reserved.
 *
 * Use of this source code is governed by terms that can be
 * found in the LICENSE file in the root of this package.
 */

// Checks that the GitHub Pages source of this repo is "GitHub Actions"
// (build_type "workflow"). When the source is the branch build, GitHub's
// Jekyll build publishes the README instead of the Astro site — that is
// what broke the main page on 2026-10-08 (ticket 18). With --fix the source
// is set back through the API; without it a wrong source fails the script.
//
// Usage: node scripts/check-pages-source.js [--fix] [owner/repo]
// Needs the GitHub CLI, logged in or with GH_TOKEN set.

import { execFileSync } from 'child_process';

function gh(args) {
  return execFileSync('gh', args, {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  }).trim();
}

function repoSlug(argv) {
  const slug = argv.find((arg) => !arg.startsWith('--'));
  if (slug) return slug;
  return JSON.parse(gh(['repo', 'view', '--json', 'nameWithOwner']))
    .nameWithOwner;
}

function buildType(slug) {
  return JSON.parse(gh(['api', `repos/${slug}/pages`])).build_type;
}

function main() {
  const argv = process.argv.slice(2);
  const fix = argv.includes('--fix');
  const slug = repoSlug(argv);
  let type = buildType(slug);
  if (type === 'workflow') {
    console.log(`✅ The Pages source of ${slug} is GitHub Actions.`);
    return;
  }
  console.log(`The Pages source of ${slug} is "${type}", not "workflow".`);
  if (fix) {
    gh([
      'api',
      '--method',
      'PUT',
      `repos/${slug}/pages`,
      '-f',
      'build_type=workflow',
    ]);
    type = buildType(slug);
    if (type === 'workflow') {
      console.log('✅ The Pages source is set back to GitHub Actions.');
      return;
    }
  }
  console.error(
    [
      '❌ The site would be overwritten by the branch build. Run:',
      `gh api --method PUT repos/${slug}/pages -f build_type=workflow`,
    ].join('\n'),
  );
  process.exit(1);
}

main();
