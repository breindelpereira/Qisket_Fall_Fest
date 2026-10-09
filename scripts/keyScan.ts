/**
 * Looks for API keys in text. A key in the app, in the repo, or in a build is a leak, so the tutor has a check for it
 * (npm run check:no-keys). The patterns are in their own module so the tests can try them without touching the disk.
 */

/** The shape of a real key. Never allowed anywhere: not in the source, not in a build. */
const KEY_SHAPES: { name: string; pattern: RegExp }[] = [
  { name: 'Google API key', pattern: /AIza[0-9A-Za-z_-]{35}/ },
  { name: 'Anthropic API key', pattern: /sk-ant-[A-Za-z0-9_-]{20,}/ },
  { name: 'OpenAI-style API key', pattern: /\bsk-[A-Za-z0-9]{32,}/ },
  { name: 'Private key block', pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
];

/** Names that belong to the function only. They must never be in what is shipped to phones or browsers. */
const SERVER_ONLY_NAMES: { name: string; pattern: RegExp }[] = [
  { name: 'GEMINI_API_KEY', pattern: /GEMINI_API_KEY/ },
  { name: 'x-goog-api-key header', pattern: /x-goog-api-key/i },
  { name: 'Gemini API address', pattern: /generativelanguage\.googleapis\.com/ },
];

export interface KeyFinding {
  file: string;
  what: string;
}

/** `shipped` text is what users receive (a build), so the server-only names are checked too. */
export function scanText(file: string, text: string, shipped: boolean): KeyFinding[] {
  const found: KeyFinding[] = [];
  for (const { name, pattern } of KEY_SHAPES) if (pattern.test(text)) found.push({ file, what: name });
  if (shipped) for (const { name, pattern } of SERVER_ONLY_NAMES) if (pattern.test(text)) found.push({ file, what: `${name} (server only)` });
  return found;
}

/** Only these file types are read; images and fonts cannot hide a readable key in a useful way. */
export const TEXT_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.css', '.html', '.json', '.txt', '.map', '.svg', '.md', '.xml', '.webmanifest', '.ts', '.tsx', '.toml', '.properties', '.gradle', '.kt', '.java']);
