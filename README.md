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

This site is being built. [The graph](https://audaudio.github.io/graph/)
describes the engine: persistent nodes, immutable programs, transactions,
the realtime queues, time and the lifecycle.
[The headless host](https://audaudio.github.io/host/) runs a graph without
Dart, as the plugin shells do, and shows how the realtime contract is
tested. [Audio IO](https://audaudio.github.io/io/) plays and records on iOS
and Android and recovers from route changes and interruptions. The plan,
the decisions and the architecture are in the project management repo
[aud_audio_pm](https://github.com/audaudio/aud_audio_pm); the packages
live in the GitHub organization [audaudio](https://github.com/audaudio).

## The graph

`aud_audio_graph` is the engine of the family: Dart edits a graph of
nodes, the C++ engine renders it block by block on the audio thread. The
package builds on the contracts of `aud_audio_core` - the C ABI, the event
and timing formats - and `aud_audio_io` and the plugin shells call its
render function.

### Instances and programs

A node is a persistent instance with a stable handle. It is created and
prepared on the control thread, keeps its state - voices, phases, delay
lines - for its whole life and is addressed by that handle in every
command. What the audio thread runs is something else: an immutable
render program, a list of jobs over the instances with every buffer
assigned in advance. A program never changes once it is published; a
change of the topology compiles a new one.

The compiler orders the nodes topologically and refuses cycles. Feedback
runs through a feedback node whose delay is defined in samples and is at
least the largest block, so that its reader can run before its writer.
Where paths of different latency meet, the shorter ones are delayed to
the longest, unless a connection opts out as low latency. Buffers are
reused as soon as their last reader has run.

### Transactions

The control thread edits the topology in a transaction: connect,
disconnect, remove. The commit compiles one program and publishes it with
a revision number; the audio thread adopts it at the start of its next
block and reports the revision back, so an app knows which revision is
running and can wait for it. Parameter changes and events never
compile - they travel through the queues.

Nothing clicks on a commit. A removed connection fades out over 5 ms, a
new one fades in, and a removed node keeps rendering until its fade or
its tail has passed - a reverb rings out, at most for 10 s - before the
engine frees it and tells the control thread. Running notes of a removed
node are closed with note-offs.

### Commands and the realtime contract

Commands are separated by class. Parameter changes take their own queue;
the latest value per block wins. Events, cancellations and transport
requests take the event queue. Both queues have fixed capacities and
refuse an enqueue when they are full: nothing is dropped silently. The
audio thread applies a bounded budget of entries per block and carries the
rest over in order.

An event carries a time in one of the domains of the core: immediately,
a sample position, a host time or a beat. Events for a later block wait
in a time-ordered scheduler with a lookahead of 10 s; they carry an id and
can be cancelled by id or per node. A scheduled event is delivered early
by the path latency of its node, so that it is heard at its time; a live
event is delivered as early as possible. A late event plays at the start
of the block with a diagnostic, or is dropped if the graph is configured
so. Events with the same time keep their order, except that the
note-off of a sounding note precedes a note-on of the same note, so that
notes retrigger; a note-on and its own note-off at the same time stay in
order, so that a short note never hangs.

The engine tracks the notes it delivered and closes them with note-offs
when a node retires, when the transport stops or seeks for nodes that
reset on it, and with the first block after the graph stops or is
prepared anew. Meters and taps publish into lossy
buffers the control thread reads whenever it likes. The audio thread never
calls into Dart: a notification thread wakes the control thread, which
takes the notifications - adopted revisions, finished nodes, diagnostics,
events emitted into the graph's event input, transport changes.

### Time and the transport

Every block comes with the time of the stream. Host times feed the
sample-to-host-time filter of the core, which turns the jittering
callback times into a stable mapping; without host times the engine
synthesizes them from the sample clock. The internal transport provides
tempo, time signature, start, stop, seek and loop and captures a list of
segments per block, so that a request taking effect inside a block splits
it. A plugin host's transport takes precedence; other providers, Link
among them, register through the host api.

### The lifecycle

A graph is created with its format, prepared, running, suspended or
stopped. A suspension renders silence and keeps the transport and the
pending events; a stop closes the running notes and resets the time
filter; a prepare for a new sample rate or block size reprepares every
instance and recompiles the program. Rendering offline runs the same
engine on the calling thread over a virtual timeline, with any sequence
of block sizes, so that tests and exports are deterministic.

### The graph document

A graph is saved as a JSON document: the buses of the graph, its nodes
with their presets, the audio and event connections and the transport
settings. The editor, the presets and the plugin shells share this
document; `AudGraph.fromDocument` builds a graph from it and
`AudGraph.toDocument` writes one. The page shows the reference chain - an
oscillator into a filter, a gain and a mixer, with the graph's event input
driving the oscillator - as a document; rendered offline for a second, the
chain gives the first second of a 220 Hz sawtooth through a resonant low
pass. The schema of the document is `aud_graph_document.schema.json` in
the package; the node presets follow the schema of `aud_audio_core`.

### The reference nodes

| Type                   | What it does                                                     |
| ---------------------- | ---------------------------------------------------------------- |
| `aud.graph.oscillator` | Sine, saw, square or triangle; plays notes from its MIDI input   |
| `aud.graph.filter`     | A state-variable filter: low, high, band pass or notch           |
| `aud.graph.mixer`      | Eight inputs with a gain each and a master gain                  |
| `aud.graph.feedback`   | A delay line in samples that closes a feedback loop              |
| `aud.graph.tap`        | Passes the signal through and keeps its recent frames and meters |
| `aud.core.gain`        | The reference node of the core, a ramped gain                    |

Tests, the example app and the benchmarks use these nodes until the DSP
packages exist.

## The headless host

The headless host runs a graph without Dart. The plugin shells for VST3,
CLAP and AUv3 are its first users: a plugin host loads them into its own
process, hands them audio buffers and expects a state it can save and
restore. The host lives in `aud_audio_graph` next to the engine as the C
API `aud_host_*`; Dart reaches it through `AudHost`.

### Loading a document

A host loads a graph document - the JSON of
[the graph](https://audaudio.github.io/graph/) - into a graph. It checks
all of the document first: the schema, the node types,
the ids, the buses against the graph's, the parameters and string keys of
every preset, the state versions, the asset files on disk and the
parameter ids. Only then does it create the nodes, apply their presets and
connect them, in one transaction. A document that does not fit changes
nothing, and the host says which part failed. A document loaded over
another one replaces it without a click: the old nodes fade out while the
new ones fade in.

### Presets and state

A node preset sets string settings, a state blob and parameters, applied
in this order: the strings load what the node needs - a sample, an
instrument -, the state blob restores what parameters cannot hold, and the
parameters come last. The host keeps the value of every parameter, since
the engine has none to report, so a node keeps parameter values out of its
state blob. The engine calls the state functions of a node only while no
block renders it: on a running graph the node is parked for the
microseconds of the call, and a block rendered meanwhile leaves it silent.

Saving writes the document back with the current parameters, strings and
state blobs. Loading that document restores the plugin: the state a
plugin host keeps is this document.

### Assets

A document lists the files its nodes load, each with an id and a path. A
string setting names a file as `asset:<id>`; the host resolves the path
against its base directory - the preset folder of a plugin, say - and
hands the node the full path. When a file has moved, the host relinks the
asset and applies every string that names it again. The page shows
the reference chain with a saved gain and a sampler whose instrument is
an asset; the sampler node `aud.sampler.sfz` comes with
`aud_dsp_sampler`, the other nodes are the reference nodes of the graph.

### Parameter ids

Plugin hosts address parameters by a number that must not change between
versions of a plugin. The host derives it from the node id and the
parameter id: FNV-1a over `<node id>/<parameter id>`, with the top bit
cleared as VST3 hosts expect. Renaming a node changes its ids; adding,
removing or reordering nodes and parameters changes none of the others. A
document whose ids collide is refused.

### Latency, tail and events

The host reports the latency of the graph and its tail: the longest tail
of a node plus the latency between that node and the outputs, or an
endless tail when a node never ends. A plugin host renders the graph
through a render call that also returns the events the graph sends to its
event input - the notes of an arpeggiator, for example - in the order of
their sample offsets. A freewheeling host - a bounce, an export - marks
its blocks offline, so the nodes know and no overload is reported.

### Testing the realtime contract

The native tests drive the engine the way streams and plugin hosts do,
under load: queues that overflow and refuse, late events, a transaction
in front of every block with a click detector on the output, route
changes to a new sample rate and block size while notes play, a full
scheduler and a full note tracker, and a stream that renders on its own
thread while the control thread calls everything it may call. They run
three times: under the address and the undefined behaviour sanitizers,
under Clang's RealtimeSanitizer - with a probe that proves it catches an
allocation on the audio thread - and under the thread sanitizer.

A debug watchdog counts every allocation, free and log call on the audio
thread and fails the tests on any. An app turns it on with the user
define `watchdog: true` of `aud_audio_graph`; a release build carries none
of it.

## Audio IO

`aud_audio_io` connects the engine to the audio devices of the platform. On
Android it plays and records through Oboe, on iOS through miniaudio on an
AVAudioSession of its own; macOS, Windows and Linux get their backends
later and run a null device until then. The C API is `aud_io_*`; Dart
reaches it through `AudIoSession` and `AudIoStream`.

### Sessions and devices

An app opens one session. It owns the backend and lists the devices: their
id, name, direction and route - speaker, headset, USB, Bluetooth and
others -, their channel counts and sample rates, and whether they are the
default. On iOS the list holds the outputs of the current route and the
available inputs; iOS chooses the output itself. On Android the list comes
from `AudioManager`, which the package reaches through JNI. When devices
come or go, the session says so: iOS reports its route changes, Android is
read every second and whenever a stream loses its device.

### Streams

A stream plays, records or does both. It asks for devices, channels, a
sample rate - or the device's, followed across route changes -, a buffer
size and the largest block its render function takes. The render function
is native: the stream calls it on the audio thread with planar buses and
the time of the block, the render interface the graph and the plugin
shells share. A client hands the stream the graph's render function and
the graph as its user. The stream splits device callbacks larger than the
largest block, so the render function never sees more frames than it was
prepared for, however the hardware calls back. Nothing on the audio thread
allocates, locks, logs or calls into Dart.

### The time of a block

Every block carries its sample position, the host time at which its first
frame reaches the output - for a stream that only records, the time it was
captured -, where that time comes from, how accurate it is, and the latency
of each direction. On Android the times come from AAudio's timestamps; on
iOS they are estimates: the time of the callback plus its block and the
latency the audio session reports. The accuracy is the mean deviation of
the host times from the sample clock. After a stream was stopped or its
device was away, the sample position runs on by the frames it missed: the
time filters of the engine see the jump and start over.

### When the device changes

Devices go away, routes change, a call takes the audio. A stream deals
with each case on its own and reports it:

- **A lost device** - a headset unplugged, an AAudio stream closed by a
  route change - is opened again by a worker thread of the stream, with
  short waits between the attempts; a requested device that is gone gives
  way to the default one. After five seconds without success the stream
  reports that it failed; starting it again tries anew.
- **A new sample rate or channel count** makes the stream hold its render
  function: it plays silence and keeps time until the client has prepared
  its renderer for the new format - for the graph: suspend, prepare,
  resume - and acknowledged it. The transport of the graph keeps its
  position. A render function that follows the format on its own, like
  those of the package, is not held.
- **An interruption** - a phone call, Siri, an app that takes the audio
  focus on Android, iOS suspending the app - stops the stream; when the
  system gives the audio back, it starts again. On iOS the return of the
  app to the foreground ends an interruption too.
- **The reset of the media services** on iOS opens every stream anew.

From the loss of a device to the first callback after it is back the
budget is 500 ms; on the null device the stream itself takes about 2 ms of
it.

### Permission and focus

Recording needs the microphone permission. The session reads it and asks
for it - iOS through the audio session, Android through the app's
activity. An app declares the microphone in its `Info.plist` and its
`AndroidManifest.xml`. On Android the session holds the audio focus while
a stream plays: when another app takes it, the streams are interrupted,
and they resume when it comes back.

### Counters

A stream counts its callbacks and their sizes, the time between them and
inside them, late callbacks, xruns, disconnects, recoveries and their
duration, interruptions, held blocks and the errors of the render
function, and it keeps the time of the last block. Notifications reach
Dart through a notification thread that the audio thread wakes.

### Building

The Android build hook compiles Oboe from source and links the library
with 16 KB pages, which Android 15 devices need; a script proves the
alignment with `llvm-readelf`. Only the functions of the C API are visible.
On iOS miniaudio compiles into an Objective-C++ unit. Both libraries are
vendored and listed in the notices of the package. The package needs the
Flutter SDK, because its Android part calls Java through `package:jni`.

### Testing and measuring

The null device keeps time without hardware and takes the faults of real
devices on request: disconnects, new rates and channel counts,
interruptions, late callbacks, xruns, hot-plugs, failing opens and a
refused permission. The native tests run on it three times: under the
address and undefined behaviour sanitizers, under Clang's
RealtimeSanitizer - with the stream callbacks marked nonblocking and a
probe that proves an allocation in the render function is caught - and
under the thread sanitizer. The Dart tests run the null device into a real
graph across a change of the sample rate.

The example app runs on simulators, emulators and devices. Its latency
probe plays a click every half second and finds it again at the input
through a loop - a cable or the air -, and its report compares the
measured round trip with the latency the stream reported. The page shows
the report of a duplex stream on the null device, whose loop returns the
output after exactly the reported latency: every click is found 512
frames later, the latency the stream reported.

The numbers of the reference devices - an iPhone 15 or newer and a Pixel 8
or newer - go into the plan of ticket 21 as they are measured.

## Pages

| Page                                                  | Source                         |
| ----------------------------------------------------- | ------------------------------ |
| [Start](https://audaudio.github.io/)                  | `src/content/docs/index.mdx`   |
| [Overview](https://audaudio.github.io/overview/)      | `src/content/docs/overview.md` |
| [The graph](https://audaudio.github.io/graph/)        | `src/content/docs/graph.mdx`   |
| [The headless host](https://audaudio.github.io/host/) | `src/content/docs/host.mdx`    |
| [Audio IO](https://audaudio.github.io/io/)            | `src/content/docs/io.mdx`      |

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
