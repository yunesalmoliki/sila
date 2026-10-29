// مزامنة بين الأجهزة بلا حسابات: «رمز ربط» عشوائي سري يُنشأ على جهازك.
// البيانات تُشفَّر على الجهاز (AES-256) قبل الإرسال، والخادم يرى نصًا مشفرًا فقط
// ومعرّفًا مشتقًا من الرمز؛ لا اسم ولا رقم ولا ملاحظة تظهر لأي أحد غيرك.

import * as local from './data/localAdapter.js';
import { mergeStates, canonical } from './syncMerge.js';
import { SYNC_URL, SYNC_KEY } from './syncConfig.js';

const KEY = 'sila.sync.v1';
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const enc = new TextEncoder();
const dec = new TextDecoder();

function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } }
function save(s) { localStorage.setItem(KEY, JSON.stringify(s)); }

export function isSyncEnabled() { return !!load().secret; }
export function getSyncInfo() { const s = load(); return { enabled: !!s.secret, lastSyncAt: s.lastSyncAt || null, secret: s.secret || null }; }

export function formatSecret(secret) { return secret.match(/.{1,4}/g).join('-'); }

export function normalizeSecret(input) {
  return String(input || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function isValidSecret(secret) {
  return secret.length === 20 && [...secret].every((c) => ALPHABET.includes(c));
}

function generateSecret() {
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  return [...bytes].map((b) => ALPHABET[b % 32]).join('');
}

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = (str) => Uint8Array.from(atob(str), (c) => c.charCodeAt(0));

async function derive(secret) {
  const id = hex(await crypto.subtle.digest('SHA-256', enc.encode('sila-id:' + secret)));
  const base = await crypto.subtle.importKey('raw', enc.encode(secret), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: enc.encode('sila-key-v1'), iterations: 150000, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'],
  );
  return { id, key };
}

async function encrypt(key, obj) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(obj)));
  const out = new Uint8Array(12 + ct.byteLength);
  out.set(iv, 0);
  out.set(new Uint8Array(ct), 12);
  return b64(out);
}

async function decrypt(key, blob) {
  const raw = unb64(blob);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: raw.slice(0, 12) }, key, raw.slice(12));
  return JSON.parse(dec.decode(pt));
}

async function rpc(name, body) {
  const res = await fetch(`${SYNC_URL}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: { apikey: SYNC_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    const err = new Error(text);
    err.conflict = text.includes('conflict');
    throw err;
  }
  return text ? JSON.parse(text) : null;
}

let running = null;

// يزامن الآن. يُعيد { ok, changed } أو { ok:false, reason }
export function syncNow() {
  if (!isSyncEnabled()) return Promise.resolve({ ok: false, reason: 'disabled' });
  if (running) return running;
  running = doSync().finally(() => { running = null; });
  return running;
}

async function doSync() {
  const st = load();
  let changedLocal = false;
  try {
    const { id, key } = await derive(st.secret);
    for (let attempt = 0; attempt < 4; attempt++) {
      const rows = await rpc('sila_sync_get', { p_id: id });
      const remoteRow = rows && rows[0];
      const localSnap = local.getSyncSnapshot();
      let remote = { people: [], contactLogs: [], deleted: {} };
      if (remoteRow) {
        try { remote = await decrypt(key, remoteRow.blob); } catch { return { ok: false, reason: 'bad-code' }; }
      }
      const merged = mergeStates(localSnap, remote);
      if (canonical(merged) !== canonical(localSnap)) {
        local.applyMergedState(merged);
        changedLocal = true;
      }
      if (remoteRow && canonical(merged) === canonical(remote)) {
        save({ ...load(), lastSyncAt: new Date().toISOString() });
        if (changedLocal) window.dispatchEvent(new CustomEvent('sila:data-merged'));
        return { ok: true, changed: changedLocal };
      }
      try {
        await rpc('sila_sync_put', { p_id: id, p_blob: await encrypt(key, merged), p_expected: remoteRow ? remoteRow.version : 0 });
        save({ ...load(), lastSyncAt: new Date().toISOString() });
        if (changedLocal) window.dispatchEvent(new CustomEvent('sila:data-merged'));
        return { ok: true, changed: changedLocal };
      } catch (e) {
        if (!e.conflict) throw e;
      }
    }
    return { ok: false, reason: 'busy' };
  } catch {
    return { ok: false, reason: 'offline' };
  }
}

// تفعيل المزامنة على هذا الجهاز برمز جديد
export async function enableSync() {
  const secret = generateSecret();
  save({ ...load(), secret });
  const r = await syncNow();
  if (!r.ok) { save({ ...load(), secret: undefined }); }
  return { ...r, secret };
}

// ربط هذا الجهاز برمز موجود (يجب أن توجد بيانات بهذا الرمز)
export async function linkWithCode(input) {
  const secret = normalizeSecret(input);
  if (!isValidSecret(secret)) return { ok: false, reason: 'invalid' };
  try {
    const { id } = await derive(secret);
    const rows = await rpc('sila_sync_get', { p_id: id });
    if (!rows || !rows[0]) return { ok: false, reason: 'not-found' };
  } catch {
    return { ok: false, reason: 'offline' };
  }
  const prev = load();
  save({ ...prev, secret });
  const r = await syncNow();
  if (!r.ok) save(prev);
  return r;
}

export function disableSync() {
  const s = load();
  delete s.secret;
  delete s.lastSyncAt;
  save(s);
}

export async function deleteCloudCopy() {
  const st = load();
  if (!st.secret) return false;
  try {
    const { id } = await derive(st.secret);
    await rpc('sila_sync_delete', { p_id: id });
    return true;
  } catch {
    return false;
  }
}

let timer = null;
export function startAutoSync() {
  const schedule = () => {
    if (!isSyncEnabled()) return;
    clearTimeout(timer);
    timer = setTimeout(() => syncNow(), 2500);
  };
  window.addEventListener('sila:data-changed', schedule);
  window.addEventListener('online', schedule);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') schedule(); });
  schedule();
}
