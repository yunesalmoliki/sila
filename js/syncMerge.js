// دمج حالتين (هذا الجهاز + السحابة) دون فقدان أي بيانات:
// الأحدث تعديلًا يفوز لكل شخص، وسجلات التواصل تُجمع كلها، وعمليات الحذف تُحفظ كشواهد زمنية.

const later = (a, b) => (a || '') >= (b || '');

export function mergeStates(a, b) {
  const deleted = { ...(a.deleted || {}) };
  for (const [id, t] of Object.entries(b.deleted || {})) {
    if (!deleted[id] || t > deleted[id]) deleted[id] = t;
  }

  const byId = new Map();
  for (const p of [...(a.people || []), ...(b.people || [])]) {
    const cur = byId.get(p.id);
    if (!cur || !later(cur.updatedAt, p.updatedAt)) byId.set(p.id, p);
  }

  const people = [];
  for (const p of byId.values()) {
    const tomb = deleted[p.id];
    if (tomb && tomb >= (p.updatedAt || '')) continue;
    if (tomb) delete deleted[p.id];
    people.push({ ...p });
  }
  const alive = new Set(people.map((p) => p.id));

  const logs = new Map();
  for (const l of [...(a.contactLogs || []), ...(b.contactLogs || [])]) {
    if (alive.has(l.personId) && !logs.has(l.id)) logs.set(l.id, l);
  }
  const contactLogs = [...logs.values()];

  for (const p of people) {
    let max = p.lastContactDate || null;
    for (const l of contactLogs) {
      if (l.personId === p.id && (!max || l.date > max)) max = l.date;
    }
    p.lastContactDate = max;
  }

  people.sort((x, y) => (x.id < y.id ? -1 : 1));
  contactLogs.sort((x, y) => (x.id < y.id ? -1 : 1));
  return { people, contactLogs, deleted };
}

export function canonical(state) {
  const s = mergeStates(state, { people: [], contactLogs: [], deleted: {} });
  return JSON.stringify(s);
}
