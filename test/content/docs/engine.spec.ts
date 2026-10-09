// @license
// Copyright (c) Audanika. All Rights Reserved.
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, expect, it } from 'vitest';

// The snippets of the engine page. The Dart code is the example of the
// umbrella's README; the tests below check that it builds the chain the
// page describes and that the report agrees with itself.
const start = `
// #region start
import 'package:aud_audio/aud_audio.dart';

void main() {
  final engine = AudEngine();
  final graph = engine.graph;
  final osc = graph.createNode('aud.graph.oscillator');
  final filter = graph.createNode('aud.graph.filter');
  graph.transaction(
    (tx) => tx
      ..connect(osc, filter)
      ..connect(filter, graph.io),
  );
  graph.setParam(filter, 'cutoff', 1200);
  engine.start();
}
// #endregion start
`;

const packages = `
// #region packages
import 'package:aud_audio/aud_audio_ffi.dart';

final engine = AudEngine(
  packages: [
    AudNativeNodePackage(
      'aud_dsp_effects',
      Native.addressOf(aud_dsp_effects_register),
    ),
  ],
);
engine.prepare();
print(engine.registrations); // AUD_OK, or AUD_ERROR_ABI_MAJOR
// #endregion packages
`;

// The numbers of the example app on an iPad Pro 11" (M5) with its
// speaker, ten minutes, 50 measurements of command to sound.
const report = `
// #region numbers
{
  "sampleRate": 48000.0,
  "bufferFrames": 256,
  "blocksRendered": 112762,
  "renderTimeMaxNs": 2252292,
  "renderTimeMeanNs": 10364,
  "callbacks": 112762,
  "callbackTimeMaxNs": 2261208,
  "callbackTimeMeanNs": 11056,
  "xruns": 0,
  "lateCallbacks": 2,
  "outputLatencyFrames": 784,
  "commandToSoundMinNs": 17122082,
  "commandToSoundMeanNs": 20439105,
  "commandToSoundMaxNs": 21554832
}
// #endregion numbers
`;

const strip = (text: string, region: string) =>
  text.replace(new RegExp(`^// #(end)?region ${region}$`, 'gm'), '');

describe('the snippets of the engine page', () => {
  it('start an engine with oscillator -> filter -> output', () => {
    const code = strip(start, 'start');
    expect(code).toContain("import 'package:aud_audio/aud_audio.dart';");
    expect(code).toContain('AudEngine()');
    expect(code).toMatch(
      /connect\(osc, filter\)[\s\S]*connect\(filter, graph\.io\)/,
    );
    expect(code.indexOf('transaction')).toBeLessThan(code.indexOf('start()'));
  });

  it('register a package through its register function', () => {
    const code = strip(packages, 'packages');
    expect(code).toContain('aud_audio_ffi.dart');
    expect(code).toMatch(/Native\.addressOf\(aud_\w+_register\)/);
    expect(code).toContain('engine.prepare()');
  });
});

describe('the numbers of the engine page', () => {
  const numbers = JSON.parse(strip(report, 'numbers')) as Record<
    string,
    number
  >;

  it('render every callback in time and without xruns', () => {
    expect(numbers.blocksRendered).toBe(numbers.callbacks);
    expect(numbers.xruns).toBe(0);
    const periodNs = (numbers.bufferFrames * 1e9) / numbers.sampleRate;
    expect(numbers.callbackTimeMaxNs).toBeLessThan(periodNs);
    expect(numbers.renderTimeMeanNs).toBeLessThan(numbers.renderTimeMaxNs);
  });

  it('put command to sound above the output latency', () => {
    const latencyNs = (numbers.outputLatencyFrames * 1e9) / numbers.sampleRate;
    expect(numbers.commandToSoundMinNs).toBeLessThanOrEqual(
      numbers.commandToSoundMeanNs,
    );
    expect(numbers.commandToSoundMeanNs).toBeLessThanOrEqual(
      numbers.commandToSoundMaxNs,
    );
    expect(numbers.commandToSoundMeanNs).toBeGreaterThan(latencyNs);
  });
});
