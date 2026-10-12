/**
 * Topology Compiler: a two-qubit gate needs the two qubits to be neighbours. When they are not, the compiler moves one
 * of them with SWAP gates until they are. A SWAP is three CNOTs, so connectivity has a price in extra gates and noise.
 *
 * The router here is deliberately simple: for each gate, take the first qubit along a shortest path towards the second
 * until they touch, and keep the new arrangement for the gates that follow. Real compilers search for better orders and
 * move qubits both ways, so they do at least as well; the lab says so.
 */
export type TopologyId = 'line' | 'grid' | 'all';

export interface Topology {
  id: TopologyId;
  name: string;
  /** Which hardware looks like this, in one phrase. */
  example: string;
  neighbours: (qubits: number) => number[][];
}

const adjacencyFromEdges = (n: number, edges: [number, number][]): number[][] => {
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }
  return adj;
};

/** A grid with `cols` columns (2 or 3 for six qubits and fewer). */
function gridEdges(n: number): [number, number][] {
  const cols = n <= 4 ? 2 : 3;
  const edges: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    if ((i + 1) % cols !== 0 && i + 1 < n) edges.push([i, i + 1]);
    if (i + cols < n) edges.push([i, i + cols]);
  }
  return edges;
}

export const TOPOLOGIES: Topology[] = [
  {
    id: 'line',
    name: 'A line',
    example: 'a chain of qubits where each touches two neighbours',
    neighbours: (n) => adjacencyFromEdges(n, Array.from({ length: n - 1 }, (_, i) => [i, i + 1] as [number, number])),
  },
  {
    id: 'grid',
    name: 'A grid',
    example: 'a square lattice like many superconducting chips',
    neighbours: (n) => adjacencyFromEdges(n, gridEdges(n)),
  },
  {
    id: 'all',
    name: 'Everyone to everyone',
    example: 'the ions in one trap chain',
    neighbours: (n) => adjacencyFromEdges(n, Array.from({ length: n }, (_, a) => Array.from({ length: n - a - 1 }, (_, k) => [a, a + 1 + k] as [number, number])).flat()),
  },
];

export const topologyById = (id: TopologyId): Topology => TOPOLOGIES.find((t) => t.id === id)!;

export type Gate = [number, number];

export interface Circuit {
  id: string;
  name: string;
  qubits: number;
  gates: Gate[];
  /** What the circuit is, in a phrase. */
  about: string;
}

export const CIRCUITS: Circuit[] = [
  { id: 'chain', name: 'Neighbour chain', qubits: 4, gates: [[0, 1], [1, 2], [2, 3]], about: 'a ladder of entangling gates, each between consecutive qubits (a GHZ state)' },
  { id: 'star', name: 'One to all', qubits: 4, gates: [[0, 1], [0, 2], [0, 3]], about: 'qubit 0 interacts with every other qubit' },
  { id: 'all_pairs', name: 'Every pair', qubits: 4, gates: [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]], about: 'all six pairs of four qubits, as in a quantum Fourier transform' },
  { id: 'far', name: 'Far apart', qubits: 6, gates: [[0, 5]], about: 'a single gate between the two ends' },
  { id: 'ring6', name: 'Ring of six', qubits: 6, gates: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]], about: 'a closed loop of gates around six qubits' },
];

export const circuitById = (id: string): Circuit => CIRCUITS.find((c) => c.id === id) ?? CIRCUITS[0];

/** Shortest path between two physical qubits (list of qubits from `a` to `b`), by breadth-first search. */
export function shortestPath(adj: number[][], a: number, b: number): number[] {
  if (a === b) return [a];
  const prev = new Array<number>(adj.length).fill(-1);
  const seen = new Array<boolean>(adj.length).fill(false);
  seen[a] = true;
  const queue = [a];
  while (queue.length) {
    const v = queue.shift() as number;
    for (const w of adj[v]) {
      if (seen[w]) continue;
      seen[w] = true;
      prev[w] = v;
      if (w === b) {
        const path = [b];
        let c = b;
        while (prev[c] !== -1) {
          c = prev[c];
          path.unshift(c);
        }
        return path;
      }
      queue.push(w);
    }
  }
  return []; // not connected
}

export interface RouteStep {
  /** The gate in program qubits. */
  gate: Gate;
  /** SWAPs added before it, as pairs of physical qubits. */
  swaps: [number, number][];
}

export interface RouteResult {
  steps: RouteStep[];
  swaps: number;
  /** Two-qubit gates in the program. */
  gates: number;
  /** CNOTs after compiling: each gate is one, each SWAP is three. */
  cnots: number;
  /** The same thing as a factor over the circuit as written. */
  overhead: number;
}

export function route(circuit: Circuit, topologyId: TopologyId): RouteResult {
  const adj = topologyById(topologyId).neighbours(circuit.qubits);
  // where each program qubit sits, and which program qubit sits at each place
  const where = Array.from({ length: circuit.qubits }, (_, i) => i);
  const at = Array.from({ length: circuit.qubits }, (_, i) => i);
  const steps: RouteStep[] = [];
  let swaps = 0;
  for (const gate of circuit.gates) {
    const path = shortestPath(adj, where[gate[0]], where[gate[1]]);
    const moves: [number, number][] = [];
    // walk the first qubit along the path until it touches the second
    for (let k = 0; k + 2 < path.length; k++) {
      const from = path[k];
      const to = path[k + 1];
      const a = at[from];
      const b = at[to];
      at[from] = b;
      at[to] = a;
      where[a] = to;
      where[b] = from;
      moves.push([from, to]);
    }
    swaps += moves.length;
    steps.push({ gate, swaps: moves });
  }
  const gates = circuit.gates.length;
  const cnots = gates + 3 * swaps;
  return { steps, swaps, gates, cnots, overhead: gates ? cnots / gates : 1 };
}

/** The cost of a very naive router that swaps in and swaps back for every gate. The lab's router must never exceed it. */
export function naiveSwaps(circuit: Circuit, topologyId: TopologyId): number {
  const adj = topologyById(topologyId).neighbours(circuit.qubits);
  return circuit.gates.reduce((sum, [a, b]) => sum + 2 * Math.max(0, shortestPath(adj, a, b).length - 2), 0);
}
