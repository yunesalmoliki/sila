// مصدر البيانات السحابي: Firestore مباشرة من المتصفح، بلا أي خادم وسيط وبلا أدوات بناء —
// عبر استيراد ديناميكي لمكتبة Firebase من CDN الرسمي، فقط عند الحاجة الفعلية.
// لا يحدث أي اتصال شبكي من هذا الملف إطلاقًا قبل أن يُعدَّ firebaseConfig.js فعليًا.

import { firebaseConfig, isFirebaseConfigured } from '../firebaseConfig.js';
import { uid, todayISO } from '../utils.js';
import { baselineDate, nextDueDate, overdueDays } from './localAdapter.js';
import { getDegree } from '../content.js';

const SDK_VERSION = '10.13.2';

let app = null;
let auth = null;
let db = null;
let ax = null; // وحدة firebase-auth
let fx = null; // وحدة firebase-firestore

async function ensureInit() {
  if (app) return;
  if (!isFirebaseConfigured()) throw new Error('Firebase غير مُعدّ بعد');
  const [appMod, authMod, fsMod] = await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-auth.js`),
    import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-firestore.js`),
  ]);
  ax = authMod;
  fx = fsMod;
  app = appMod.initializeApp(firebaseConfig);
  auth = ax.getAuth(app);
  db = fx.getFirestore(app);
}

export function isConfigured() {
  return isFirebaseConfigured();
}

// يستدعي callback(user|null) عند كل تغيّر في حالة الدخول، ويُعيد دالة لإلغاء المراقبة
export async function watchAuth(callback) {
  if (!isFirebaseConfigured()) { callback(null); return () => {}; }
  await ensureInit();
  return ax.onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle() {
  await ensureInit();
  const provider = new ax.GoogleAuthProvider();
  const result = await ax.signInWithPopup(auth, provider);
  return result.user;
}

export async function signOutUser() {
  await ensureInit();
  await ax.signOut(auth);
}

export function currentUser() {
  return auth?.currentUser || null;
}

function peopleCol() {
  const u = currentUser();
  if (!u) throw new Error('غير مسجَّل الدخول');
  return fx.collection(db, 'users', u.uid, 'people');
}

function logsCol(personId) {
  const u = currentUser();
  return fx.collection(db, 'users', u.uid, 'people', personId, 'logs');
}

export async function getAllPeople({ includeArchived = false } = {}) {
  await ensureInit();
  const snap = await fx.getDocs(peopleCol());
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((p) => !p.deleted && (includeArchived || !p.archived));
}

export async function getPerson(id) {
  await ensureInit();
  const snap = await fx.getDoc(fx.doc(peopleCol(), id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createPerson(data) {
  await ensureInit();
  const id = uid();
  const person = {
    name: data.name.trim(),
    phone: data.phone,
    degreeId: data.degreeId,
    periodicityDays: data.periodicityDays,
    note: data.note || '',
    dateAdded: todayISO(),
    lastContactDate: null,
    archived: false,
    deleted: false,
    createdAt: fx.serverTimestamp(),
    updatedAt: fx.serverTimestamp(),
  };
  await fx.setDoc(fx.doc(peopleCol(), id), person);
  return { id, ...person };
}

export async function updatePerson(id, data) {
  await ensureInit();
  await fx.updateDoc(fx.doc(peopleCol(), id), { ...data, updatedAt: fx.serverTimestamp() });
  return getPerson(id);
}

export async function setArchived(id, archived) {
  return updatePerson(id, { archived });
}

export async function deletePerson(id) {
  // حذف ناعم: يبقي أثرًا يمكن لأجهزة أخرى اكتشافه بدل حذف صامت قد يسبب تعارضًا
  await ensureInit();
  await fx.updateDoc(fx.doc(peopleCol(), id), { deleted: true, deletedAt: fx.serverTimestamp() });
}

export async function getLogsForPerson(personId) {
  await ensureInit();
  const snap = await fx.getDocs(logsCol(personId));
  return snap.docs
    .map((d) => ({ id: d.id, personId, ...d.data() }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function addContactLog({ personId, type, date, note }) {
  await ensureInit();
  const id = uid();
  const logDate = date || todayISO();
  const log = { type, date: logDate, note: note || '', createdAt: fx.serverTimestamp(), updatedAt: fx.serverTimestamp() };
  await fx.setDoc(fx.doc(logsCol(personId), id), log);

  const person = await getPerson(personId);
  if (person && (!person.lastContactDate || logDate >= person.lastContactDate)) {
    await updatePerson(personId, { lastContactDate: logDate, snoozeUntil: null });
  }
  return { id, personId, ...log };
}

export async function getDuePeopleSorted(today = todayISO()) {
  return (await getAllPeople())
    .map((p) => ({ person: p, overdue: overdueDays(p, today) }))
    .filter((x) => x.overdue >= 0)
    .filter((x) => !x.person.snoozeUntil || today >= x.person.snoozeUntil)
    .sort((a, b) => {
      const scoreA = a.overdue * getDegree(a.person.degreeId).weight;
      const scoreB = b.overdue * getDegree(b.person.degreeId).weight;
      return scoreB - scoreA;
    });
}

export async function hasAnyPeople() {
  const all = await getAllPeople({ includeArchived: true });
  return all.length > 0;
}

export { baselineDate, nextDueDate, overdueDays };

// رفع بيانات محلية إلى الحساب دفعة واحدة ذرّية (تنجح كاملة أو تفشل كاملة)،
// مع تفادي تكرار من يطابق رقم هاتفه شخصًا موجودًا أصلًا في الحساب.
export async function migrateLocalData(localPeople, localLogsByPerson) {
  await ensureInit();
  const cloudPeople = await getAllPeople({ includeArchived: true });
  const cloudPhones = new Set(cloudPeople.map((p) => p.phone).filter(Boolean));
  const toUpload = localPeople.filter((p) => !(p.phone && cloudPhones.has(p.phone)));

  const writes = [];
  for (const p of toUpload) {
    writes.push({
      ref: fx.doc(peopleCol(), p.id),
      data: {
        name: p.name, phone: p.phone, degreeId: p.degreeId, periodicityDays: p.periodicityDays,
        note: p.note || '', dateAdded: p.dateAdded, lastContactDate: p.lastContactDate || null,
        archived: !!p.archived, deleted: false,
        createdAt: fx.serverTimestamp(), updatedAt: fx.serverTimestamp(),
      },
    });
    for (const log of (localLogsByPerson[p.id] || [])) {
      writes.push({
        ref: fx.doc(logsCol(p.id), log.id),
        data: {
          type: log.type, date: log.date, note: log.note || '',
          createdAt: fx.serverTimestamp(), updatedAt: fx.serverTimestamp(),
        },
      });
    }
  }

  for (let i = 0; i < writes.length; i += 400) {
    const batch = fx.writeBatch(db);
    for (const w of writes.slice(i, i + 400)) batch.set(w.ref, w.data);
    await batch.commit();
  }

  return { uploadedPeople: toUpload.length, uploadedLogs: writes.length - toUpload.length };
}
