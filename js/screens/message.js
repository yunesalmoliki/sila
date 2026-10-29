import { Icon } from '../icons.js';
import { T, MESSAGE_TEMPLATES, pickTemplateBucket, pickTemplateCloseness } from '../content.js';
import { getPerson, getLogsForPerson } from '../db.js';
import { firstName, buildWaLink, normalizePhone, daysBetween, todayISO } from '../utils.js';
import { setTopbar, setScreen, hideTabbar, wireBack, toast, openSheet, escapeHtml } from '../ui.js';
import { navigate, back } from '../router.js';
import { openConfirmContactSheet } from './logContact.js';

export async function renderMessage(params) {
  const person = await getPerson(params.id);
  if (!person) { navigate('/people'); return; }

  const lastLogWithNote = (await getLogsForPerson(person.id)).find((l) => l.note);
  const hintNote = lastLogWithNote ? lastLogWithNote.note : person.note;

  hideTabbar();
  setTopbar(`
    <button class="icon-btn" id="btn-back" aria-label="رجوع">${Icon.back}</button>
    <h1>${T.message.title}</h1>
  `);
  wireBack(() => back());

  const daysSince = person.lastContactDate ? daysBetween(person.lastContactDate, todayISO()) : null;
  const bucket = pickTemplateBucket(daysSince);
  const closeness = pickTemplateCloseness(person.degreeId);
  const suggestions = MESSAGE_TEMPLATES[closeness][bucket].map((t) => t.replace('{name}', firstName(person.name)));

  let mode = 'pick'; // 'pick' | 'edit'
  let text = '';

  paint();

  function paint() {
    if (mode === 'pick') {
      setScreen(`
        ${suggestions.map((s, i) => `
          <div class="template-card" data-i="${i}">${escapeHtml(s)}</div>
        `).join('')}
        <div class="template-card custom" id="custom-card">${Icon.edit} ${T.message.customOption}</div>

        ${hintNote ? `
          <div class="hint-box"><b>${T.message.lastNoteHint}</b> ${escapeHtml(hintNote)}</div>
        ` : ''}
      `);

      document.querySelectorAll('.template-card[data-i]').forEach((card) => {
        card.onclick = () => { text = suggestions[Number(card.dataset.i)]; mode = 'edit'; paint(); };
      });
      document.getElementById('custom-card').onclick = () => { text = ''; mode = 'edit'; paint(); };
      return;
    }

    const hasValidPhone = normalizePhone(person.phone).length >= 8;

    setScreen(`
      <button class="link-btn" id="back-to-pick">${Icon.chevronLeft} اختيار رسالة أخرى</button>
      <div class="field">
        <label>${T.message.editorTitle}</label>
        <textarea id="editor" placeholder="${T.message.textareaPlaceholder}" style="min-height:140px">${escapeHtml(text)}</textarea>
      </div>
      ${!hasValidPhone ? `<div class="hint-box" style="color:var(--danger)">${T.message.noPhone}</div>` : ''}
      <div class="btn-row" style="margin-bottom:10px">
        <button class="btn btn-whatsapp" id="btn-open-wa" ${!hasValidPhone ? 'disabled' : ''}>${Icon.whatsapp}${T.message.openWhatsapp}</button>
      </div>
      <button class="btn btn-outline" id="btn-copy">${Icon.copy}${T.message.copyText}</button>
      <p style="color:var(--ink-600);font-size:12.5px;text-align:center;margin-top:14px;line-height:1.6">
        إذا لم يُفتح واتساب تلقائياً، استخدم زر النسخ وأرسل الرسالة من واتساب مباشرة.
      </p>
    `);

    document.getElementById('back-to-pick').onclick = () => { mode = 'pick'; paint(); };
    const editor = document.getElementById('editor');
    editor.oninput = (e) => { text = e.target.value; };

    if (hasValidPhone) {
      document.getElementById('btn-open-wa').onclick = () => {
        const finalText = editor.value.trim();
        if (!finalText) return;
        openWaConfirmSheet(finalText);
      };
    }

    document.getElementById('btn-copy').onclick = async () => {
      const finalText = editor.value.trim();
      if (!finalText) return;
      try {
        await navigator.clipboard.writeText(finalText);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = finalText;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      toast(T.message.copied);
    };
  }

  function openWaConfirmSheet(finalText) {
    openSheet(`
      <div class="sheet-handle"></div>
      <div class="sheet-title">${T.message.confirmTitle}</div>
      <p style="color:var(--ink-600);font-size:13px;margin:-8px 0 12px">${T.message.confirmHint} ${escapeHtml(person.name)}</p>
      <div class="note-box" style="white-space:pre-wrap">${escapeHtml(finalText)}</div>
      <div class="btn-row">
        <button class="btn btn-outline" id="wa-cancel">${T.message.confirmBack}</button>
        <button class="btn btn-whatsapp" id="wa-confirm">${Icon.whatsapp}${T.message.openWhatsapp}</button>
      </div>
    `, {
      onMount(sheetEl, close) {
        sheetEl.querySelector('#wa-cancel').onclick = close;
        sheetEl.querySelector('#wa-confirm').onclick = () => {
          close();
          const link = buildWaLink(person.phone, finalText);
          window.open(link, '_blank', 'noopener');
          armReturnPrompt();
        };
      },
    });
  }

  function armReturnPrompt() {
    const handler = () => {
      window.removeEventListener('focus', handler);
      openConfirmContactSheet(person, () => navigate(`/person/${person.id}`));
    };
    window.addEventListener('focus', handler, { once: true });
  }
}
