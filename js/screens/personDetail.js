import { Icon } from '../icons.js';
import { T, getDegree } from '../content.js';
import { getPerson, getLogsForPerson, updatePerson, overdueDays, nextDueDate } from '../db.js';
import { sinceLabel, daysBetween, todayISO, addDays } from '../utils.js';
import { setTopbar, setScreen, hideTabbar, wireBack, avatarHtml, degreeBadgeHtml, iconChip, escapeHtml, openSheet, toast } from '../ui.js';
import { navigate, back } from '../router.js';
import { openLogContactSheet } from './logContact.js';

const TYPE_ICON = { message: Icon.chatHeart, call: Icon.phoneCall, meeting: Icon.people, visit: Icon.visit };

export async function renderPersonDetail(params) {
  const person = await getPerson(params.id);
  if (!person) { navigate('/people'); return; }

  hideTabbar();
  setTopbar(`
    <button class="icon-btn" id="btn-back" aria-label="رجوع">${Icon.back}</button>
    <div style="flex:1"></div>
    <button class="icon-btn" id="btn-edit" aria-label="تعديل بيانات الشخص">${Icon.edit}</button>
  `);
  wireBack(() => back());
  document.getElementById('btn-edit').onclick = () => navigate(`/person/${person.id}/edit`);

  paint();

  async function paint() {
    const degree = getDegree(person.degreeId);
    const overdue = overdueDays(person);
    const due = nextDueDate(person);
    const logs = await getLogsForPerson(person.id);

    const lastContactValue = person.lastContactDate
      ? sinceLabel(daysBetween(person.lastContactDate, todayISO()))
      : T.personDetail.never;

    const snoozed = !!person.snoozeUntil && person.snoozeUntil > todayISO();
    const snoozeLabel = snoozed
      ? new Date(person.snoozeUntil + 'T00:00:00').toLocaleDateString('ar', { day: 'numeric', month: 'long' })
      : '';

    let dueLabel;
    if (overdue > 0) dueLabel = T.personDetail.overdueBy(overdue);
    else if (overdue === 0) dueLabel = T.personDetail.dueToday;
    else dueLabel = T.personDetail.notDueYet;

    setScreen(`
      <div class="detail-hero">
        ${avatarHtml(person.name, 84)}
        <h2>${escapeHtml(person.name)}</h2>
        <div class="degree-badge">${degreeBadgeHtml(person.degreeId)}</div>
      </div>

      <div class="stat-grid">
        <div class="stat-card">
          <div class="label">${iconChip(Icon.clock, 'sage', 'sm')}${T.personDetail.lastContact}</div>
          <div class="value">${lastContactValue}</div>
        </div>
        <div class="stat-card ${overdue >= 0 ? 'warn' : ''}">
          <div class="label">${iconChip(Icon.calendar, overdue >= 0 ? 'amber' : 'sage', 'sm')}${T.personDetail.nextDue}</div>
          <div class="value">${dueLabel}</div>
        </div>
      </div>

      ${snoozed ? `
        <div class="hint-box" style="display:flex;align-items:center;justify-content:space-between;gap:10px">
          <span>${T.personDetail.snoozedUntil(snoozeLabel)}</span>
          <button class="link-btn" id="btn-unsnooze">${T.personDetail.snoozeCancel}</button>
        </div>
      ` : ''}

      ${person.note ? `
        <div class="note-box">
          <div class="label">${T.personDetail.noteLabel}</div>
          <div>${escapeHtml(person.note)}</div>
        </div>
      ` : ''}

      <div class="sticky-actions">
        <button class="btn btn-whatsapp" id="btn-message">${Icon.whatsapp}${T.personDetail.messageBtn}</button>
        <button class="btn btn-secondary" id="btn-log">${Icon.history}${T.personDetail.logBtn}</button>
      </div>
      <button class="btn btn-ghost" id="btn-snooze" style="margin-top:4px">${Icon.clock}${T.personDetail.snoozeBtn}</button>

      <div class="section-title">${T.personDetail.timelineTitle}</div>
      ${logs.length === 0 ? `
        <p style="color:var(--ink-600);font-size:13.5px">${T.personDetail.timelineEmpty}</p>
      ` : `
        <div class="timeline">
          ${logs.map((l) => `
            <div class="timeline-item">
              ${iconChip(TYPE_ICON[l.type] || Icon.chatHeart, 'sage', 'sm')}
              <div style="flex:1">
                <div class="t-type">${T.logContact.types[l.type] || l.type}</div>
                <div class="t-date">${sinceLabel(daysBetween(l.date, todayISO()))}</div>
                ${l.note ? `<div class="t-note">${escapeHtml(l.note)}</div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      `}
    `);

    document.getElementById('btn-message').onclick = () => navigate(`/person/${person.id}/message`);
    document.getElementById('btn-snooze').onclick = () => openSnoozeSheet();
    const unsnooze = document.getElementById('btn-unsnooze');
    if (unsnooze) {
      unsnooze.onclick = async () => {
        await updatePerson(person.id, { snoozeUntil: null });
        person.snoozeUntil = null;
        paint();
      };
    }
    document.getElementById('btn-log').onclick = () => {
      openLogContactSheet(person, () => paint());
    };
  }

  function openSnoozeSheet() {
    openSheet(`
      <div class="sheet-handle"></div>
      <div class="sheet-title">${T.personDetail.snoozeTitle}</div>
      <p style="color:var(--ink-600);font-size:13.5px;margin:-8px 0 14px">${T.personDetail.snoozeHint}</p>
      <div class="chip-group">
        ${T.personDetail.snoozeOptions.map((o) => `<button type="button" class="chip" data-days="${o.days}">${o.label}</button>`).join('')}
      </div>
    `, {
      onMount(sheetEl, close) {
        sheetEl.querySelectorAll('.chip').forEach((chip) => {
          chip.onclick = async () => {
            const until = addDays(todayISO(), Number(chip.dataset.days));
            await updatePerson(person.id, { snoozeUntil: until });
            person.snoozeUntil = until;
            close();
            toast(T.personDetail.snoozeDone);
            paint();
          };
        });
      },
    });
  }
}
