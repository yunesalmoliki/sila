import { Icon, Illustration } from '../icons.js';
import { T, APP_NAME } from '../content.js';
import { getDuePeopleSorted, hasAnyPeople, getAllPeople } from '../db.js';
import { getSetting, setSetting } from '../settings.js';
import { todayISO, addDays } from '../utils.js';
import { setTopbar, setScreen, showTabbar, personRowHtml } from '../ui.js';
import { navigate } from '../router.js';

export async function renderHome() {
  setTopbar(`
    <h1>${APP_NAME}</h1>
    <button class="icon-btn" id="btn-account" aria-label="الحساب والبيانات">${Icon.cloud}</button>
  `);
  showTabbar('home', (tab) => navigate(tab === 'home' ? '/' : '/people'));
  document.getElementById('btn-account').onclick = () => navigate('/account');

  if (!(await hasAnyPeople())) {
    setScreen(`
      <div class="empty-state">
        <div class="hero-illustration">${Illustration.connectHero}</div>
        <h2>${T.home.firstRunTitle}</h2>
        <p>${T.home.firstRunBody}</p>
        <button class="btn btn-primary" id="cta-add" style="width:auto">
          ${Icon.plus}${T.home.firstRunCta}
        </button>
      </div>
    `);
    document.getElementById('cta-add').onclick = () => navigate('/person/new');
    return;
  }

  const due = await getDuePeopleSorted();
  const nudge = await backupNudgeHtml();

  if (due.length === 0) {
    setScreen(`
      ${nudge}
      <h1 style="font-size:19px;margin:14px 0 4px;">${T.home.title}</h1>
      <div class="empty-state">
        <div class="icon-wrap">${Icon.sparkle}</div>
        <h2>${T.home.emptyTitle}</h2>
        <p>${T.home.emptySubtitle}</p>
      </div>
    `);
    wireNudge();
    return;
  }

  setScreen(`
    ${nudge}
    <h1 style="font-size:19px;margin:14px 0 2px;">${T.home.title}</h1>
    <p style="font-size:13.5px;color:var(--ink-600);margin:0 0 16px;">${T.home.subtitle(due.length)}</p>
    <div id="list">
      ${due.map((x) => personRowHtml(x.person)).join('')}
    </div>
  `);

  document.querySelectorAll('#list .person-row').forEach((row) => {
    row.onclick = () => navigate(`/person/${row.dataset.id}`);
  });
  wireNudge();
}

async function backupNudgeHtml() {
  const people = await getAllPeople({ includeArchived: true });
  if (people.length < 3) return '';
  const today = todayISO();
  const until = getSetting('nudgeUntil');
  if (until && today < until) return '';
  const last = getSetting('lastBackupAt');
  if (last && (Date.now() - new Date(last).getTime()) < 30 * 86400000) return '';
  return `
    <div class="nudge" id="backup-nudge">
      <span>${T.backupNudge.text}</span>
      <span class="nudge-actions">
        <button class="btn small btn-primary" id="nudge-go" style="box-shadow:none">${T.backupNudge.cta}</button>
        <button class="btn small btn-ghost" id="nudge-later">${T.backupNudge.later}</button>
      </span>
    </div>`;
}

function wireNudge() {
  const go = document.getElementById('nudge-go');
  if (!go) return;
  go.onclick = () => navigate('/account');
  document.getElementById('nudge-later').onclick = () => {
    setSetting('nudgeUntil', addDays(todayISO(), 14));
    document.getElementById('backup-nudge').remove();
  };
}
