/** localStorage can be missing or blocked (private windows, previews); callers then just do not remember anything. */
export function safeStorage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}
