// Thin wrapper around @vercel/kv. Returns null / false when KV creds are
// missing instead of throwing — that lets local dev work without KV
// provisioned, and lets the proxy fall back to direct-fetch in that case.

import { kv } from '@vercel/kv';

export const kvAvailable = !!(
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
);

export async function kvGet(key) {
  if (!kvAvailable) return null;
  try {
    return await kv.get(key);
  } catch (e) {
    console.error('[kv] get failed for', key, e);
    return null;
  }
}

export async function kvSet(key, value) {
  if (!kvAvailable) return false;
  try {
    await kv.set(key, value);
    return true;
  } catch (e) {
    console.error('[kv] set failed for', key, e);
    return false;
  }
}
