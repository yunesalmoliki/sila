import { Icon } from '../icons.js';
import { T } from '../content.js';
import { DEGREES } from '../content.js';
import { getAllPeople } from '../db.js';
import { setTopbar, setScreen, showTabbar, personRowHtml, escapeHtml } from '../ui.js';
import { navigate } from '../router.js';

let query = '';
let activeDegree = null;
let showArchived = false;

export async function renderPeople() {
  setTopbar(`
    <h1>${T.people.title}</h1>
    <button class="icon-btn primary" id="btn-add" aria-label="إضافة شخص">${Icon.plus}</button>
  `);
  showTabbar('people', (tab) => navigate(tab === 'home' ? '/' : '/people'));
  document.getElementById('btn-add').onclick = () => navigate('/person/new');

  await paint();
}

async function paint() {
  const all = await getAllPeople({ includeArchived: showArchived });
  const filtered = all.filter((p) => {
    if (activeDegree && p.degreeId !== activeDegree) return false;
    if (query && !p.name.includes(query)) return false;
    return true;
  });

  setScreen(`
    <div class="search-box">
      ${Icon.people}
      <input type="text" id="search" placeholder="${T.people.searchPlaceholder}" value="${escapeHtml(query)}" />
    </div>
    <div class="filter-row" id="filters">
      <button class="chip ${!activeDegree ? 'active' : ''}" data-deg="" style="${!activeDegree ? 'background:var(--clay-600)' : ''}">الكل</button>
      ${DEGREES.map((d) => `
        <button class="chip ${activeDegree === d.id ? 'active' : ''}" data-deg="${d.id}"
          style="${activeDegree === d.id ? `background:${d.color}` : ''}">${d.name}</button>
      `).join('')}
    </div>
    ${filtered.length === 0 ? `
      <div class="empty-state" style="padding-top:32px">
        <div class="icon-wrap">${Icon.people}</div>
        <h2>${all.length === 0 ? T.people.emptyTitle : 'لا توجد نتيجة'}</h2>
        <p>${all.length === 0 ? T.people.emptySubtitle : 'جرّب كلمة بحث أخرى'}</p>
      </div>
    ` : `<div id="list">${filtered.map((p) => personRowHtml(p)).join('')}</div>`}
    <button class="archived-toggle" id="btn-archived">
      ${Icon.archive}${showArchived ? T.people.archivedToggleHide : T.people.archivedToggleShow}
    </button>
  `);

  document.getElementById('search').oninput = (e) => { query = e.target.value; paint(); };
  document.getElementById('btn-archived').onclick = () => { showArchived = !showArchived; paint(); };
  document.querySelectorAll('#filters .chip').forEach((chip) => {
    chip.onclick = () => { activeDegree = chip.dataset.deg || null; paint(); };
  });
  document.querySelectorAll('#list .person-row').forEach((row) => {
    row.onclick = () => navigate(`/person/${row.dataset.id}`);
  });
}
