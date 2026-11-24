import { parse } from 'smol-toml';

// Pass plain JSON-compatible tables across the Server-to-Client component boundary.
export function parseContentToml<T>(content: string): T {
  return JSON.parse(JSON.stringify(parse(content, { unsafeKeyBehaviour: 'throw' }))) as T;
}
