# Changelog

## Unreleased

### Added

- Add the page The graph: how aud_audio_graph renders, with the
  reference chain as a tested graph document (ticket 19)
- Add the page The headless host: graph documents with presets, state
  and assets, parameter ids, latency, tail and events without Dart, and
  how the realtime contract is tested (ticket 20)
- Add the page Audio IO: sessions, devices and streams on iOS and
  Android, the time of every block, recovery from route changes and
  interruptions, permission and focus, and how a device is measured, with
  the latency probe's report as a tested snippet (ticket 21)

### Fixed

- Repair the main page: keep the Pages source on GitHub Actions
  (scripts/check-pages-source.js runs before every deploy)

### Changed

- Feed the README from the documentation pages instead of the DNA
  README rules (AGENTS.md)
- The graph: only the note-off of a sounding note precedes a note-on of
  the same note; tracked notes close with the first block after a stop
  or a prepare (ticket 20)
