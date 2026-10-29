// مصدر البيانات المحلي: تخزين كامل في متصفح الجهاز (localStorage)، لا اتصال بأي خادم.
// هذا الملف يحتفظ بنفس منطق db.js الأصلي بلا تغيير جوهري؛ الوحدة المستدعية (db.js)
// هي التي تقرر متى تُستخدم هذه الطبقة بدل طبقة سحابية مستقبلية.

import { getDegree } from '../content.js';
import { uid, todayISO, daysBetween, addDays } from '../utils.js';

const STORAGE_KEY = 'sila.v1';

function loadRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { people: [], contactLogs: [], deleted: {} };
    const parsed = JSON.parse(raw);
    return {
      people: Array.isArray(parsed.people) ? parsed.people : [],
      contactLogs: Array.isArray(parsed.contactLogs) ? parsed.contactLogs : [],
      deleted: parsed.deleted && typeof parsed.deleted === 'object' ? parsed.deleted : {},
    };
  } catch {
    return { people: [], contactLogs: [], deleted: {} };
  }
}

let state = loadRaw();

function persist({ silent = false } = {}) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (!silent) window.dispatchEvent(new CustomEvent('sila:data-changed'));
}

// للمزامنة: لقطة كاملة، وتطبيق نتيجة دمج دون إطلاق حدث تغيير جديد
export function getSyncSnapshot() {
  return JSON.parse(JSON.stringify(state));
}

export function applyMergedState(merged) {
  state = {
    people: merged.people,
    contactLogs: merged.contactLogs,
    deleted: merged.deleted || {},
  };
  persist({ silent: true });
}

// --- الأشخاص ---

export function getAllPeople({ includeArchived = false } = {}) {
  return state.people.filter((p) => includeArchived || !p.archived);
}

export function getPerson(id) {
  return state.people.find((p) => p.id === id) || null;
}

export function createPerson(data) {
  const now = todayISO();
  const nowStamp = new Date().toISOString();
  const person = {
    id: uid(),
    name: data.name.trim(),
    phone: data.phone,
    degreeId: data.degreeId,
    periodicityDays: data.periodicityDays,
    note: data.note || '',
    dateAdded: now,
    lastContactDate: null,
    archived: false,
    createdAt: nowStamp,
    updatedAt: nowStamp,
  };
  state.people.push(person);
  persist();
  return person;
}

export function updatePerson(id, data) {
  const person = getPerson(id);
  if (!person) return null;
  Object.assign(person, data, { updatedAt: new Date().toISOString() });
  persist();
  return person;
}

export function setArchived(id, archived) {
  return updatePerson(id, { archived });
}

export function deletePerson(id) {
  state.people = state.people.filter((p) => p.id !== id);
  state.contactLogs = state.contactLogs.filter((l) => l.personId !== id);
  state.deleted[id] = new Date().toISOString();
  persist();
}

// --- سجل التواصل ---

export function getLogsForPerson(personId) {
  return state.contactLogs
    .filter((l) => l.personId === personId)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function addContactLog({ personId, type, date, note }) {
  const nowStamp = new Date().toISOString();
  const log = {
    id: uid(),
    personId,
    type,
    date: date || todayISO(),
    note: note || '',
    createdAt: nowStamp,
    updatedAt: nowStamp,
  };
  state.contactLogs.push(log);

  const person = getPerson(personId);
  if (person && (!person.lastContactDate || log.date >= person.lastContactDate)) {
    person.lastContactDate = log.date;
    person.snoozeUntil = null;
    person.updatedAt = nowStamp;
  }
  persist();
  return log;
}

// --- الحساب الأساسي: من يحتاج تواصلاً اليوم ---

// أساس حساب الموعد لمن لم يسبق التواصل معه: تاريخ إضافته، حتى لا يُغرق المستخدم
// بقائمة طويلة فور إدخال أشخاص جدد دفعة واحدة.
export function baselineDate(person) {
  return person.lastContactDate || person.dateAdded;
}

export function nextDueDate(person) {
  return addDays(baselineDate(person), person.periodicityDays);
}

export function overdueDays(person, today = todayISO()) {
  return daysBetween(nextDueDate(person), today);
}

export function getDuePeopleSorted(today = todayISO()) {
  return getAllPeople()
    .map((p) => ({ person: p, overdue: overdueDays(p, today) }))
    .filter((x) => x.overdue >= 0)
    .filter((x) => !x.person.snoozeUntil || today >= x.person.snoozeUntil)
    .sort((a, b) => {
      const scoreA = a.overdue * getDegree(a.person.degreeId).weight;
      const scoreB = b.overdue * getDegree(b.person.degreeId).weight;
      return scoreB - scoreA;
    });
}

export function hasAnyPeople() {
  return state.people.length > 0;
}

// --- نسخ احتياطي واستعادة ---

export function exportBackup() {
  return {
    app: 'sila',
    version: 1,
    exportedAt: new Date().toISOString(),
    people: state.people,
    contactLogs: state.contactLogs,
    deleted: state.deleted,
  };
}

export function importBackup(data) {
  if (!data || !Array.isArray(data.people) || !Array.isArray(data.contactLogs)) {
    throw new Error('ملف نسخة احتياطية غير صالح');
  }
  state = { people: data.people, contactLogs: data.contactLogs, deleted: data.deleted && typeof data.deleted === 'object' ? data.deleted : {} };
  persist();
}
