import { Icon } from '../icons.js';
import { T } from '../content.js';
import { addContactLog } from '../db.js';
import { todayISO } from '../utils.js';
import { openSheet, toast } from '../ui.js';

const TYPES = [
  { id: 'message', label: T.logContact.types.message, icon: Icon.chatHeart },
  { id: 'call', label: T.logContact.types.call, icon: Icon.phoneCall },
  { id: 'meeting', label: T.logContact.types.meeting, icon: Icon.people },
  { id: 'visit', label: T.logContact.types.visit, icon: Icon.visit },
];

export function openLogContactSheet(person, onSaved, { defaultType = 'message' } = {}) {
  let selectedType = defaultType;

  openSheet(sheetHtml(selectedType), {
    onMount(sheetEl, close) {
      wire(sheetEl, close);
    },
  });

  function sheetHtml(type) {
    return `
      <div class="sheet-handle"></div>
      <div class="sheet-title">${T.logContact.title}</div>

      <div class="field">
        <label>${T.logContact.type}</label>
        <div class="segmented">
          ${TYPES.map((t) => `
            <button type="button" class="seg ${type === t.id ? 'active' : ''}" data-type="${t.id}">
              ${t.icon}<span>${t.label}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <div class="field">
        <label>${T.logContact.date}</label>
        <input type="date" id="log-date" value="${todayISO()}" max="${todayISO()}" />
      </div>

      <div class="field">
        <label>${T.logContact.note}</label>
        <textarea id="log-note" placeholder="${T.logContact.notePlaceholder}"></textarea>
      </div>

      <button class="btn btn-primary" id="log-save">${Icon.check}${T.logContact.save}</button>
    `;
  }

  function wire(sheetEl, close) {
    sheetEl.querySelectorAll('.seg').forEach((btn) => {
      btn.onclick = () => {
        selectedType = btn.dataset.type;
        sheetEl.querySelectorAll('.seg').forEach((b) => b.classList.toggle('active', b === btn));
      };
    });

    sheetEl.querySelector('#log-save').onclick = async () => {
      const date = sheetEl.querySelector('#log-date').value || todayISO();
      const note = sheetEl.querySelector('#log-note').value.trim();
      await addContactLog({ personId: person.id, type: selectedType, date, note });
      close();
      toast(T.logContact.savedToast);
      if (onSaved) onSaved();
    };
  }
}

export function openConfirmContactSheet(person, onLogged) {
  const close = openSheet(`
    <div class="sheet-handle"></div>
    <div class="sheet-title">${T.confirmContact.question(person.name)}</div>
    <div class="btn-row">
      <button class="btn btn-outline" id="c-no">${T.confirmContact.notYet}</button>
      <button class="btn btn-primary" id="c-yes">${T.confirmContact.yes}</button>
    </div>
  `, {
    onMount(sheetEl, closeFn) {
      sheetEl.querySelector('#c-no').onclick = closeFn;
      sheetEl.querySelector('#c-yes').onclick = () => {
        closeFn();
        openLogContactSheet(person, onLogged, { defaultType: 'message' });
      };
    },
  });
  return close;
}
