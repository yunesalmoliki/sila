// الواجهة الوحيدة لطبقة البيانات التي تستخدمها كل الشاشات.
// البيانات محلية أولًا دائمًا؛ المزامنة (sync.js) تعمل بجانبها وتدمج النتائج في المصدر المحلي.

import * as local from './data/localAdapter.js';

export async function getAllPeople(opts) { return local.getAllPeople(opts); }
export async function getPerson(id) { return local.getPerson(id); }
export async function createPerson(data) { return local.createPerson(data); }
export async function updatePerson(id, data) { return local.updatePerson(id, data); }
export async function setArchived(id, archived) { return local.setArchived(id, archived); }
export async function deletePerson(id) { return local.deletePerson(id); }
export async function getLogsForPerson(personId) { return local.getLogsForPerson(personId); }
export async function addContactLog(data) { return local.addContactLog(data); }
export async function getDuePeopleSorted(today) { return local.getDuePeopleSorted(today); }
export async function hasAnyPeople() { return local.hasAnyPeople(); }

// حسابات بحتة على شخص محمَّل فعلًا في الذاكرة
export function baselineDate(person) { return local.baselineDate(person); }
export function nextDueDate(person) { return local.nextDueDate(person); }
export function overdueDays(person, today) { return local.overdueDays(person, today); }
