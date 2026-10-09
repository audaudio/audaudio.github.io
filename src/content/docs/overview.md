---
title: Overview
description: What the Audanika Audio Engine is and where its documentation will grow.
---

The Audanika Audio Engine (`aud_audio`) is a family of Dart packages for
Flutter apps: a signal-flow graph defined in Dart and rendered in C++,
audio IO per platform, DSP nodes, a sequencer, UI widgets and plugin
shells.

This site is being built. [The graph](/graph/) describes the engine:
persistent nodes, immutable programs, transactions, the realtime queues,
time and the lifecycle. [The headless host](/host/) runs a graph without
Dart, as the plugin shells do, and shows how the realtime contract is
tested. [Audio IO](/io/) plays and records on iOS and Android and recovers
from route changes and interruptions. The plan, the decisions and the
architecture are in the project management repo
[aud_audio_pm](https://github.com/audaudio/aud_audio_pm); the packages
live in the GitHub organization [audaudio](https://github.com/audaudio).
