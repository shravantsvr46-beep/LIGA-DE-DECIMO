import fs from 'fs';
import path from 'path';
import os from 'os';

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');
const TMP_PATH = path.join(os.tmpdir(), 'liga_db.json');

// Helper to get Upstash / Vercel KV credentials if configured in environment
function getKvConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    return { url, token };
  }
  return null;
}

export async function getDb() {
  const kv = getKvConfig();

  // 1. Try remote cloud KV (Upstash / Vercel KV) if configured
  if (kv) {
    try {
      const res = await fetch(`${kv.url}/get/liga_db`, {
        headers: { Authorization: `Bearer ${kv.token}` },
        cache: 'no-store'
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.result) {
          const parsed = typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
          globalThis.__LIGA_DB__ = parsed;
          return parsed;
        }
      }
    } catch (kvErr) {
      console.error('KV get error:', kvErr);
    }
  }

  // 2. Return from in-memory cache if available
  if (globalThis.__LIGA_DB__) {
    return globalThis.__LIGA_DB__;
  }

  // 3. Try reading from temp file (e.g. /tmp on Vercel serverless)
  try {
    if (fs.existsSync(TMP_PATH)) {
      const content = fs.readFileSync(TMP_PATH, 'utf8');
      const parsed = JSON.parse(content);
      globalThis.__LIGA_DB__ = parsed;
      return parsed;
    }
  } catch (tmpErr) {
    // fallback to static file
  }

  // 4. Default: Read from local src/data/db.json
  const fileContent = fs.readFileSync(DB_PATH, 'utf8');
  const parsed = JSON.parse(fileContent);
  globalThis.__LIGA_DB__ = parsed;

  // If KV is configured but had no data yet, seed it in background
  if (kv) {
    saveDb(parsed).catch(() => {});
  }

  return parsed;
}

export async function saveDb(data) {
  // Always update in-memory cache immediately
  globalThis.__LIGA_DB__ = data;

  const kv = getKvConfig();

  // 1. If KV configured, persist to remote cloud KV
  if (kv) {
    try {
      await fetch(`${kv.url}/set/liga_db`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kv.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
    } catch (kvErr) {
      console.error('KV set error:', kvErr);
    }
  }

  // 2. Try writing to src/data/db.json (local dev / VPS)
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (fsErr) {
    // 3. On Vercel (read-only filesystem EROFS), write to os.tmpdir() (/tmp)
    try {
      fs.writeFileSync(TMP_PATH, JSON.stringify(data, null, 2), 'utf8');
    } catch (tmpErr) {
      console.error('Failed to write to tmpdir:', tmpErr);
    }
  }

  return true;
}
