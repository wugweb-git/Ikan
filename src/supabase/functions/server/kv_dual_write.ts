/**
 * KV Dual-Write Layer
 * -------------------
 * Re-exports every function from the protected kv_store module.
 * Write operations (set, mset, del, mdel) are intercepted so they
 * also sync to the `ikan_data_sync` table.
 *
 * Reads always come from the primary KV table (kv_store_cc205da9).
 * Sync writes are fire-and-forget — failures are logged, never thrown,
 * so the primary data path is never blocked or broken.
 *
 * ── Sync table schema (create manually in Supabase dashboard) ──
 *
 *   CREATE TABLE ikan_data_sync (
 *     key        TEXT        NOT NULL PRIMARY KEY,
 *     value      JSONB       NOT NULL,
 *     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
 *   );
 *
 *   -- Optional: index for prefix scans
 *   CREATE INDEX idx_ikan_data_sync_prefix ON ikan_data_sync (key text_pattern_ops);
 */

import { createClient } from "jsr:@supabase/supabase-js@2";

// ── Primary KV (protected, read-only import) ──────────────────────
import * as kvPrimary from "./kv_store.tsx";

// ── Sync client (lazy singleton) ──────────────────────────────────
const SYNC_TABLE = "ikan_data_sync";

let _syncEnabled: boolean | null = null; // null = not yet checked

const syncClient = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

/**
 * One-time probe: does the sync table actually exist?
 * If it doesn't we disable all sync writes for the lifetime of this
 * worker so we're not spamming error logs every request.
 */
async function isSyncEnabled(): Promise<boolean> {
  if (_syncEnabled !== null) return _syncEnabled;
  try {
    const sb = syncClient();
    const { error } = await sb.from(SYNC_TABLE).select("key").limit(1);
    _syncEnabled = !error;
    if (!_syncEnabled) {
      console.log(
        `⚠️  kv_dual_write: sync table "${SYNC_TABLE}" not found — sync disabled. ` +
          `Create the table to enable dual-write. Error: ${error?.message}`,
      );
    } else {
      console.log(`✅ kv_dual_write: sync table "${SYNC_TABLE}" detected — dual-write active.`);
    }
  } catch {
    _syncEnabled = false;
  }
  return _syncEnabled;
}

// ── Sync helpers (fire-and-forget) ────────────────────────────────

async function syncSet(key: string, value: any): Promise<void> {
  if (!(await isSyncEnabled())) return;
  try {
    const sb = syncClient();
    const now = new Date().toISOString();
    const { error } = await sb.from(SYNC_TABLE).upsert(
      { key, value, updated_at: now },
      { onConflict: "key" },
    );
    if (error) {
      console.log(`⚠️  kv_dual_write syncSet error for key "${key}": ${error.message}`);
    }
  } catch (e) {
    console.log(`⚠️  kv_dual_write syncSet exception for key "${key}":`, e);
  }
}

async function syncMset(keys: string[], values: any[]): Promise<void> {
  if (!(await isSyncEnabled())) return;
  try {
    const sb = syncClient();
    const now = new Date().toISOString();
    const rows = keys.map((k, i) => ({ key: k, value: values[i], updated_at: now }));
    const { error } = await sb.from(SYNC_TABLE).upsert(rows, { onConflict: "key" });
    if (error) {
      console.log(`⚠️  kv_dual_write syncMset error: ${error.message}`);
    }
  } catch (e) {
    console.log(`⚠️  kv_dual_write syncMset exception:`, e);
  }
}

async function syncDel(key: string): Promise<void> {
  if (!(await isSyncEnabled())) return;
  try {
    const sb = syncClient();
    const { error } = await sb.from(SYNC_TABLE).delete().eq("key", key);
    if (error) {
      console.log(`⚠️  kv_dual_write syncDel error for key "${key}": ${error.message}`);
    }
  } catch (e) {
    console.log(`⚠️  kv_dual_write syncDel exception for key "${key}":`, e);
  }
}

async function syncMdel(keys: string[]): Promise<void> {
  if (!(await isSyncEnabled())) return;
  try {
    const sb = syncClient();
    const { error } = await sb.from(SYNC_TABLE).delete().in("key", keys);
    if (error) {
      console.log(`⚠️  kv_dual_write syncMdel error: ${error.message}`);
    }
  } catch (e) {
    console.log(`⚠️  kv_dual_write syncMdel exception:`, e);
  }
}

// ── Public API (drop-in replacement for kv_store) ─────────────────

/** Read-through: delegates directly to primary KV */
export const get = kvPrimary.get;

/** Read-through: delegates directly to primary KV */
export const mget = kvPrimary.mget;

/** Read-through: delegates directly to primary KV */
export const getByPrefix = kvPrimary.getByPrefix;

/**
 * Returns key-value pairs by prefix (includes the key alongside the value).
 * Useful for cleanup operations where you need to know which keys to delete.
 */
export const getKeyValuesByPrefix = async (prefix: string): Promise<Array<{ key: string; value: any }>> => {
  const sb = syncClient();
  const { data, error } = await sb.from("kv_store_cc205da9").select("key, value").like("key", prefix + "%");
  if (error) throw new Error(error.message);
  return data ?? [];
};

/**
 * Find all keys that contain a given substring (useful for aggressive cleanup).
 */
export const findKeysBySubstring = async (substring: string): Promise<string[]> => {
  const sb = syncClient();
  const { data, error } = await sb.from("kv_store_cc205da9").select("key").like("key", `%${substring}%`);
  if (error) throw new Error(error.message);
  return data?.map((d: any) => d.key) ?? [];
};

/** Write to primary KV, then fire-and-forget sync to ikan_data_sync */
export const set = async (key: string, value: any): Promise<void> => {
  await kvPrimary.set(key, value);
  // Sync is intentionally not awaited on the critical path
  syncSet(key, value).catch(() => {});
};

/** Write to primary KV, then fire-and-forget sync to ikan_data_sync */
export const mset = async (keys: string[], values: any[]): Promise<void> => {
  await kvPrimary.mset(keys, values);
  syncMset(keys, values).catch(() => {});
};

/** Delete from primary KV, then fire-and-forget sync to ikan_data_sync */
export const del = async (key: string): Promise<void> => {
  await kvPrimary.del(key);
  syncDel(key).catch(() => {});
};

/** Delete from primary KV, then fire-and-forget sync to ikan_data_sync */
export const mdel = async (keys: string[]): Promise<void> => {
  await kvPrimary.mdel(keys);
  syncMdel(keys).catch(() => {});
};