// @license
// Copyright (c) Audanika. All Rights Reserved.
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, expect, it } from 'vitest';

// The graph document the graph page shows: the reference chain.
const text = `
// #region document
{
  "schema": 1,
  "name": "Reference chain",
  "outputChannels": [2],
  "nodes": [
    {
      "id": "osc",
      "type": "aud.graph.oscillator",
      "outputChannels": [2],
      "preset": {
        "schema": 1,
        "type": "aud.graph.oscillator",
        "params": { "frequency": 220, "waveform": 1 }
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
      "preset": { "schema": 1, "type": "aud.core.gain", "params": { "gain": 0.8 } }
    },
    { "id": "mixer", "type": "aud.graph.mixer" }
  ],
  "connections": [
    { "from": "osc", "to": "filter" },
    { "from": "filter", "to": "gain" },
    { "from": "gain", "to": "mixer", "toBus": 0 },
    { "from": "mixer", "to": "graph" }
  ],
  "eventConnections": [{ "from": "graph", "to": "osc" }],
  "transport": { "tempo": 120, "numerator": 4, "denominator": 4 }
}
// #endregion document
`;

type Connection = { from: string; to: string };

type Document = {
  schema: number;
  nodes: { id: string; type: string }[];
  connections: Connection[];
  eventConnections: Connection[];
};

describe('the graph document of the graph page', () => {
  const document = JSON.parse(
    text.replace(/^\/\/ #(end)?region document$/gm, ''),
  ) as Document;

  it('follows the schema version 1 with unique node ids', () => {
    expect(document.schema).toBe(1);
    const ids = document.nodes.map((node) => node.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).not.toContain('graph');
    for (const node of document.nodes) {
      expect(node.type).toMatch(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/);
    }
  });

  it('connects known nodes only', () => {
    const ids = new Set(['graph', ...document.nodes.map((node) => node.id)]);
    for (const c of [...document.connections, ...document.eventConnections]) {
      expect(ids.has(c.from)).toBe(true);
      expect(ids.has(c.to)).toBe(true);
    }
    expect(document.connections.at(-1)).toEqual({ from: 'mixer', to: 'graph' });
  });
});
