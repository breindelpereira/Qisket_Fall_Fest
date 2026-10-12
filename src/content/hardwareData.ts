/**
 * Real hardware figures used by the Part 2 labs (the Comparison Dashboard shows them side by side).
 *
 * Rules for this file:
 *  - Every record is ONE published system or result, with a source, a link and the date of that source (`asOf`).
 *    Nothing here is a vendor slogan: a number is only included if the source states it, and a field is left out when the
 *    source does not give it.
 *  - Figures go stale quickly. To refresh one: read the new source, change the record (value, `source`, `url`, `asOf`),
 *    and then check the two places that quote hardware in words: the lesson text in `lessonsPart2.ts` and the notes in
 *    `tutor/notes/hw_module_*.md`, and run `npm run tutor:index`.
 *  - Records describe a single device or experiment, not a modality as a whole. `caveat` says what the record does NOT show.
 *  - Illustrative numbers (slider defaults in a lab) are NOT in this file; each lab labels those itself.
 */
export type ModalityId = 'superconducting' | 'trapped_ion' | 'neutral_atom' | 'photonic' | 'silicon_spin' | 'annealing';

export interface Modality {
  id: ModalityId;
  name: string;
  /** The lesson that explains it. */
  lessonId: string;
}

export const MODALITIES: Modality[] = [
  { id: 'superconducting', name: 'Superconducting circuits', lessonId: 'hw_module_1' },
  { id: 'trapped_ion', name: 'Trapped ions', lessonId: 'hw_module_2' },
  { id: 'neutral_atom', name: 'Neutral atoms', lessonId: 'hw_module_3' },
  { id: 'photonic', name: 'Photonic qubits', lessonId: 'hw_module_4' },
  { id: 'silicon_spin', name: 'Silicon spin qubits', lessonId: 'hw_module_5' },
  { id: 'annealing', name: 'Quantum annealing', lessonId: 'hw_module_6' },
];

export interface HardwareRecord {
  id: string;
  modality: ModalityId;
  /** The device or experiment, as the source names it. */
  system: string;
  /** How many qubits the source reports (omitted if it does not say). */
  qubits?: number;
  /** How the source words the qubit count, when a bare number would mislead ("more than 4,400"). */
  qubitsText?: string;
  /** Two-qubit gate (or fusion) error as a fraction: 0.0033 is 0.33%. Omitted if the source gives none. */
  twoQubitError?: number;
  /** What the error figure is exactly, when it is not a plain two-qubit gate. */
  errorNote?: string;
  /** Mean T1 in microseconds (omitted if the source gives none). */
  t1Us?: number;
  /** How qubits can interact, in the source's terms. */
  connectivity: string;
  /** One plain sentence on what this record shows. */
  shows: string;
  /** What it does NOT show: always filled in. */
  caveat: string;
  source: string;
  url: string;
  /** Date of the source, `YYYY-MM-DD` or `YYYY-MM`. */
  asOf: string;
}

export const HARDWARE: HardwareRecord[] = [
  {
    id: 'google_willow',
    modality: 'superconducting',
    system: 'Google Willow, error-correction chip',
    qubits: 105,
    twoQubitError: 0.0033,
    errorNote: 'CZ gate, mean error with all gates running at once (±0.18%)',
    t1Us: 68,
    connectivity: 'Square grid: 3.47 neighbours per qubit on average, 4 typical',
    shows: 'A chip where larger error-correcting patches made errors fall, not rise (surface code distance 3, 5 and 7).',
    caveat: 'One chip from one lab. The same spec sheet lists a second chip with a different T1 (98 µs): there is a trade-off between shielding and coherence.',
    source: 'Google Quantum AI, Willow spec sheet (also Nature, 2024: "Quantum error correction below the surface code threshold")',
    url: 'https://quantumai.google/static/site-assets/downloads/willow-spec-sheet.pdf',
    asOf: '2024-12-09',
  },
  {
    id: 'quantinuum_h2',
    modality: 'trapped_ion',
    system: 'Quantinuum H2',
    qubits: 56,
    twoQubitError: 0.00157,
    errorNote: 'two-qubit gate fidelity 99.843(5)%, across pairs of the 56 qubits',
    connectivity: 'Arbitrary: any qubit can interact with any other',
    shows: 'A trapped-ion machine with all-to-all connectivity and a two-qubit error below 0.2%.',
    caveat: 'The source gives no gate speed or coherence time. Ion gates are generally slower than superconducting ones, which this record does not show.',
    source: 'DeCross et al., "The computational power of random quantum circuits in arbitrary geometries", arXiv:2406.02501',
    url: 'https://arxiv.org/abs/2406.02501',
    asOf: '2024-06-04',
  },
  {
    id: 'harvard_rydberg',
    modality: 'neutral_atom',
    system: 'Harvard / MIT / QuEra neutral-atom array',
    qubits: 60,
    qubitsText: 'up to 60 atoms in parallel',
    twoQubitError: 0.005,
    errorNote: 'CZ gate fidelity about 99.5% (99.48% with 60 atoms at once)',
    connectivity: 'Reconfigurable: atoms are moved with tweezers between gates',
    shows: 'Entangling gates on many atom pairs at the same time, at about 99.5% fidelity.',
    caveat: 'A research experiment, not a product. The two-qubit gates here worked on up to 60 atoms; the same group reported a smaller number for three-qubit gates (about 97.9%).',
    source: 'Evered et al., "High-fidelity parallel entangling gates on a neutral-atom quantum computer", Nature 622, 268 (2023)',
    url: 'https://doi.org/10.1038/s41586-023-06481-y',
    asOf: '2023-10-11',
  },
  {
    id: 'xanadu_aurora',
    modality: 'photonic',
    system: 'Xanadu Aurora',
    qubits: 12,
    connectivity: 'Modular: 35 photonic chips linked by about 13 km of optical fibre',
    shows: 'A networked machine built from many photonic chips, as a proof of concept for a modular design.',
    caveat: 'A scale model, not a fault-tolerant machine; the authors and the company name optical loss as the next problem. No error rate is given here.',
    source: 'Aghaee Rad et al., "Scaling and networking a modular photonic quantum computer", Nature 638 (2025)',
    url: 'https://doi.org/10.1038/s41586-024-08406-9',
    asOf: '2025-01-22',
  },
  {
    id: 'psiquantum_omega',
    modality: 'photonic',
    system: 'PsiQuantum Omega chipset (component results)',
    twoQubitError: 0.0078,
    errorNote: 'two-qubit fusion fidelity 99.22 ± 0.12%',
    connectivity: 'Fusions between photons on a manufactured chip, with chip-to-chip links',
    shows: 'Photonic components made in a commercial chip foundry, with a two-qubit fusion fidelity near 99.2%.',
    caveat: 'These figures are conditional on a photon being detected, so they do not include photon loss. They are not an error rate for a running computer.',
    source: 'PsiQuantum, "A manufacturable platform for photonic quantum computing", Nature (2025)',
    url: 'https://doi.org/10.1038/s41586-025-08820-7',
    asOf: '2025-02',
  },
  {
    id: 'qutech_silicon',
    modality: 'silicon_spin',
    system: 'QuTech silicon spin-qubit processor (two qubits)',
    qubits: 2,
    twoQubitError: 0.005,
    errorNote: 'one- and two-qubit gate fidelities all above 99.5%, by gate-set tomography',
    connectivity: 'Neighbouring quantum dots',
    shows: 'Spin qubits in silicon reaching the fidelity level that error-correcting codes ask for.',
    caveat: 'Two qubits, not hundreds: high fidelity on a tiny device says little about how well a large array can be tuned.',
    source: 'Xue et al., "Quantum logic with spin qubits crossing the surface code threshold", Nature 601, 343 (2022)',
    url: 'https://arxiv.org/abs/2107.00628',
    asOf: '2022-01-19',
  },
  {
    id: 'intel_tunnel_falls',
    modality: 'silicon_spin',
    system: 'Intel Tunnel Falls',
    qubits: 12,
    connectivity: 'Neighbouring quantum dots',
    shows: 'A 12-qubit silicon chip made on 300 mm wafers with the same tools as ordinary processors.',
    caveat: 'A chip for research partners. The announcement gives no two-qubit fidelity.',
    source: 'Intel newsroom: "Intel\'s New Chip to Advance Silicon Spin Qubit Research for Quantum Computing"',
    url: 'https://newsroom.intel.com/new-technologies/quantum-computing-chip-to-advance-research',
    asOf: '2023-06',
  },
  {
    id: 'dwave_advantage2',
    modality: 'annealing',
    system: 'D-Wave Advantage2',
    qubits: 4400,
    qubitsText: 'more than 4,400',
    connectivity: 'Zephyr graph: up to 20 couplings per qubit',
    shows: 'The size of a commercial annealer: thousands of qubits, each coupled to a few tens at most.',
    caveat: 'An annealer, not a gate-model computer, so its qubit count is not comparable with the others. Performance claims are the vendor\'s own, and whether annealers beat the best classical methods is still disputed.',
    source: 'D-Wave press release, "D-Wave Announces General Availability of Advantage2 Quantum Computer"',
    url: 'https://www.businesswire.com/news/home/20250520948155/en/D-Wave-Announces-General-Availability-of-Advantage2-Quantum-Computer-Its-Most-Advanced-and-Performant-System',
    asOf: '2025-05-20',
  },
];

export const HARDWARE_BY_ID: Record<string, HardwareRecord> = Object.fromEntries(HARDWARE.map((r) => [r.id, r]));

export const modalityName = (id: ModalityId): string => MODALITIES.find((m) => m.id === id)?.name ?? id;
