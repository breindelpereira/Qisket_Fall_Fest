import { HARDWARE, modalityName } from '../../content/hardwareData';
import type { HardwareRecord } from '../../content/hardwareData';

/**
 * Comparison Dashboard: the data file side by side. There is no model here, only choosing, ordering and wording. The rule
 * the tests hold it to: nothing is invented (a missing figure stays missing and is shown as such), and sorting never drops
 * or adds a record.
 */
export type SortKey = 'qubits' | 'twoQubitError' | 'asOf';

export const MAX_COMPARED = 3;

/** Adds or removes a record from the selection, keeping at most `max` (the oldest choice makes room). */
export function toggleSelection(selected: string[], id: string, max = MAX_COMPARED): string[] {
  if (selected.includes(id)) return selected.filter((s) => s !== id);
  const next = [...selected, id];
  return next.length > max ? next.slice(next.length - max) : next;
}

const valueOf = (r: HardwareRecord, key: SortKey): number | string | undefined => r[key];

/**
 * Orders records by one figure. Records without that figure always go last, in both directions, and ties keep the data
 * file's order.
 */
export function sortRecords(records: HardwareRecord[], key: SortKey, direction: 'asc' | 'desc'): HardwareRecord[] {
  const indexed = records.map((r, i) => ({ r, i }));
  indexed.sort((a, b) => {
    const va = valueOf(a.r, key);
    const vb = valueOf(b.r, key);
    if (va === undefined && vb === undefined) return a.i - b.i;
    if (va === undefined) return 1;
    if (vb === undefined) return -1;
    if (va === vb) return a.i - b.i;
    const cmp = va < vb ? -1 : 1;
    return direction === 'asc' ? cmp : -cmp;
  });
  return indexed.map((x) => x.r);
}

export const NOT_GIVEN = 'not given in the source';

export function formatQubits(r: HardwareRecord): string {
  if (r.qubitsText) return r.qubitsText;
  return r.qubits === undefined ? NOT_GIVEN : String(r.qubits);
}

/** "0.33%" style; more digits for small errors. */
export function formatError(r: HardwareRecord): string {
  if (r.twoQubitError === undefined) return NOT_GIVEN;
  const percent = r.twoQubitError * 100;
  return `${percent < 1 ? percent.toFixed(2) : percent.toFixed(1)}%`;
}

export function formatT1(r: HardwareRecord): string {
  return r.t1Us === undefined ? NOT_GIVEN : `${r.t1Us} µs`;
}

export const formatDate = (r: HardwareRecord): string => r.asOf;

export interface Row {
  label: string;
  value: string;
  /** True when the source does not give this figure. */
  missing: boolean;
}

/** The figures of one record, in a fixed order, as label and text. */
export function rowsFor(r: HardwareRecord): Row[] {
  const rows: Row[] = [
    { label: 'Qubits', value: formatQubits(r), missing: r.qubits === undefined && !r.qubitsText },
    { label: 'Two-qubit error', value: formatError(r), missing: r.twoQubitError === undefined },
    { label: 'T1 (mean)', value: formatT1(r), missing: r.t1Us === undefined },
    { label: 'Connectivity', value: r.connectivity, missing: false },
  ];
  return rows;
}

/** Everything the dashboard shows, for one record. Used by the tests to check no figure is shown without its date. */
export function cardFor(r: HardwareRecord) {
  return { title: r.system, modality: modalityName(r.modality), rows: rowsFor(r), source: r.source, url: r.url, asOf: r.asOf, caveat: r.caveat };
}

export const ALL_RECORDS = HARDWARE;
