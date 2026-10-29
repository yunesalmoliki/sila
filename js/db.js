// الواجهة الوحيدة لطبقة البيانات التي تستخدمها كل الشاشات.
// توجَّه كل العمليات إلى المصدر المحلي افتراضيًا، أو إلى Firestore بعد نجاح تسجيل
// الدخول (انظر data/cloudAdapter.js وscreens/account.js) — دون أن تتغيّر أي شاشة
// تستدعي هذه الدوال، لأن توقيعها الخارجي واحد في الحالتين.

import * as local from './data/localAdapter.js';
import * as cloud from './data/cloudAdapter.js';

let mode = 'local'; // 'local' | 'cloud'

export function setMode(newMode) {
  mode = newMode === 'cloud' ? 'cloud' : 'local';
}

export function getMode() {
  return mode;
}

function activeAdapter() {
  return mode === 'cloud' ? cloud : local;
}

export async function getAllPeople(opts) {
  return activeAdapter().getAllPeople(opts);
}

export async function getPerson(id) {
  return activeAdapter().getPerson(id);
}

export async function createPerson(data) {
  return activeAdapter().createPerson(data);
}

export async function updatePerson(id, data) {
  return activeAdapter().updatePerson(id, data);
}

export async function setArchived(id, archived) {
  return activeAdapter().setArchived(id, archived);
}

export async function deletePerson(id) {
  return activeAdapter().deletePerson(id);
}

export async function getLogsForPerson(personId) {
  return activeAdapter().getLogsForPerson(personId);
}

export async function addContactLog(data) {
  return activeAdapter().addContactLog(data);
}

export async function getDuePeopleSorted(today) {
  return activeAdapter().getDuePeopleSorted(today);
}

export async function hasAnyPeople() {
  return activeAdapter().hasAnyPeople();
}

// حسابات بحتة على شخص محمَّل فعلًا في الذاكرة — لا تلمس التخزين، فتبقى متزامنة
export function baselineDate(person) {
  return local.baselineDate(person);
}

export function nextDueDate(person) {
  return local.nextDueDate(person);
}

export function overdueDays(person, today) {
  return local.overdueDays(person, today);
}
