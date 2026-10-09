// @license
// Copyright (c) Audanika. All Rights Reserved.
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, expect, it } from 'vitest';

// The report the audio IO page shows: the example app's latency probe on a
// duplex stream of the null device, five seconds long.
const text = `
// #region report
{
  "mode": "probe",
  "format": {
    "backend": "null",
    "sampleRate": 48000.0,
    "outputChannels": 2,
    "inputChannels": 2,
    "bufferFrames": 256,
    "burstFrames": 256,
    "maxFrames": 1024,
    "exclusive": true,
    "timeSource": "hardware"
  },
  "counters": {
    "callbacks": 940,
    "callbackFramesMin": 256,
    "callbackFramesMax": 256,
    "periodMeanMs": 5.33,
    "periodMaxMs": 12.81,
    "lateCallbacks": 1,
    "xruns": 0,
    "disconnects": 0,
    "recoveries": 0,
    "recoveryLastMs": 0.0,
    "recoveryMaxMs": 0.0,
    "callbackMeanMs": 0.01,
    "callbackMaxMs": 0.07,
    "jitterMaxMs": 0.0,
    "accuracyMs": 0.0,
    "outputLatencyFrames": 256,
    "inputLatencyFrames": 256
  },
  "probe": {
    "clicks": 10,
    "detections": 10,
    "roundTripFrames": 512,
    "roundTripMinFrames": 512,
    "roundTripMaxFrames": 512,
    "reportedFrames": 512,
    "errorFrames": 0
  }
}
// #endregion report
`;

type Report = {
  mode: string;
  format: {
    backend: string;
    sampleRate: number;
    outputChannels: number;
    inputChannels: number;
    bufferFrames: number;
    burstFrames: number;
    maxFrames: number;
    timeSource: string;
  };
  counters: {
    callbacks: number;
    callbackFramesMin: number;
    callbackFramesMax: number;
    periodMeanMs: number;
    outputLatencyFrames: number;
    inputLatencyFrames: number;
  };
  probe: {
    clicks: number;
    detections: number;
    roundTripFrames: number;
    roundTripMinFrames: number;
    roundTripMaxFrames: number;
    reportedFrames: number;
    errorFrames: number;
  };
};

describe('the report of the audio IO page', () => {
  const report = JSON.parse(
    text.replace(/^\/\/ #(end)?region report$/gm, ''),
  ) as Report;

  it('is the probe on a duplex stream', () => {
    expect(report.mode).toBe('probe');
    expect(report.format.outputChannels).toBeGreaterThan(0);
    expect(report.format.inputChannels).toBeGreaterThan(0);
    expect(report.format.timeSource).toBe('hardware');
  });

  it('runs the callbacks at the period of the buffer', () => {
    const { format, counters } = report;
    const bufferMs = (format.bufferFrames * 1000) / format.sampleRate;
    expect(counters.periodMeanMs).toBeCloseTo(bufferMs, 1);
    expect(counters.callbackFramesMax).toBeLessThanOrEqual(format.maxFrames);
    expect(counters.callbacks * bufferMs).toBeGreaterThan(4500);
  });

  it('finds every click after the latency the stream reported', () => {
    const { counters, probe } = report;
    expect(probe.detections).toBe(probe.clicks);
    expect(probe.reportedFrames).toBe(
      counters.outputLatencyFrames + counters.inputLatencyFrames,
    );
    expect(probe.errorFrames).toBe(
      probe.roundTripFrames - probe.reportedFrames,
    );
    expect(probe.errorFrames).toBe(0);
    expect(probe.roundTripMinFrames).toBe(probe.roundTripMaxFrames);
  });
});
