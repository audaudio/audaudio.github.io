// @license
// Copyright (c) Audanika. All Rights Reserved.
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, expect, it } from 'vitest';

// The graph document the host page shows: the reference chain with a saved
// gain and a sampler whose instrument is an asset.
const text = `
// #region document
{
  "schema": 1,
  "name": "Reference chain",
  "outputChannels": [2],
  "assets": [{ "id": "piano", "path": "instruments/piano.sfz" }],
  "nodes": [
    {
      "id": "sampler",
      "type": "aud.sampler.sfz",
      "preset": {
        "schema": 1,
        "type": "aud.sampler.sfz",
        "strings": { "sfz_file": "asset:piano" }
      }
    },
    {
      "id": "filter",
      "type": "aud.graph.filter",
      "preset": {
        "schema": 1,
        "type": "aud.graph.filter",
        "params": { "cutoff": 800, "resonance": 0.3 }
      }
    },
    {
      "id": "gain",
      "type": "aud.core.gain",
      "preset": {
        "schema": 1,
        "type": "aud.core.gain",
        "params": { "gain": 0.8 },
        "state": "zcxMPw==",
        "stateVersion": 1
      }
    }
  ],
  "connections": [
    { "from": "sampler", "to": "filter" },
    { "from": "filter", "to": "gain" },
    { "from": "gain", "to": "graph" }
  ],
  "eventConnections": [{ "from": "graph", "to": "sampler" }]
}
// #endregion document
`;

type Preset = {
  schema: number;
  type: string;
  params?: Record<string, number>;
  strings?: Record<string, string>;
  state?: string;
  stateVersion?: number;
};

type Document = {
  schema: number;
  assets: { id: string; path: string }[];
  nodes: { id: string; type: string; preset?: Preset }[];
  connections: { from: string; to: string }[];
  eventConnections: { from: string; to: string }[];
};

describe('the graph document of the host page', () => {
  const document = JSON.parse(
    text.replace(/^\/\/ #(end)?region document$/gm, ''),
  ) as Document;

  it('follows the schema version 1 with unique ids', () => {
    expect(document.schema).toBe(1);
    const ids = document.nodes.map((node) => node.id);
    expect(new Set(ids).size).toBe(ids.length);
    const assets = document.assets.map((asset) => asset.id);
    expect(new Set(assets).size).toBe(assets.length);
    for (const node of document.nodes) {
      expect(node.type).toMatch(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/);
      expect(node.preset?.type).toBe(node.type);
    }
  });

  it('names known assets in its string settings', () => {
    const assets = new Set(document.assets.map((asset) => asset.id));
    const references = document.nodes.flatMap((node) =>
      Object.values(node.preset?.strings ?? {}),
    );
    expect(references).toEqual(['asset:piano']);
    for (const value of references) {
      expect(assets.has(value.replace(/^asset:/, ''))).toBe(true);
    }
  });

  it('keeps the gain in its state blob as the parameter says', () => {
    const gain = document.nodes.find((node) => node.id === 'gain')?.preset;
    expect(gain?.stateVersion).toBe(1);
    const bytes = Buffer.from(gain?.state ?? '', 'base64');
    expect(bytes.readFloatLE(0)).toBeCloseTo(gain?.params?.gain ?? 0, 6);
  });

  it('connects known nodes only', () => {
    const ids = new Set(['graph', ...document.nodes.map((node) => node.id)]);
    for (const c of [...document.connections, ...document.eventConnections]) {
      expect(ids.has(c.from)).toBe(true);
      expect(ids.has(c.to)).toBe(true);
    }
  });
});
