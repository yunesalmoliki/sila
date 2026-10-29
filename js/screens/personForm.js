import { Icon } from '../icons.js';
import { T, DEGREES } from '../content.js';
import { getPerson, createPerson, updatePerson, deletePerson, setArchived } from '../db.js';
import { setTopbar, setScreen, hideTabbar, wireBack, toast, iconChip, escapeHtml } from '../ui.js';
import { navigate, back } from '../router.js';
import { normalizePhone, toE164, stripE164, parseVCard, toInternationalDigits } from '../utils.js';
import { getSetting, setSetting, COUNTRIES } from '../settings.js';

const contactPickerSupported = typeof navigator !== 'undefined'
  && 'contacts' in navigator && 'ContactsManager' in window;

export async function renderPersonForm(params) {
  const isEdit = !!params.id;
  const person = isEdit ? await getPerson(params.id) : null;
  if (isEdit && !person) { navigate('/people'); return; }

  hideTabbar();
  setTopbar(`
    <button class="icon-btn" id="btn-back" aria-label="رجوع">${Icon.back}</button>
    <h1>${isEdit ? T.personForm.titleEdit : T.personForm.titleAdd}</h1>
  `);
  wireBack(() => back());

  let periodicityTouched = isEdit;
  let selectedDegree = person?.degreeId || DEGREES[1].id;
  let importMode = !isEdit;

  const state = {
    name: person?.name || '',
    phone: stripE164(person?.phone || ''),
    note: person?.note || '',
    periodicityDays: person?.periodicityDays ?? DEGREES.find((d) => d.id === selectedDegree).defaultPeriodicityDays,
  };

  paint();

  function paint() {
    if (importMode) {
      paintImportChooser();
      return;
    }
    setScreen(`
      ${!isEdit ? `<button class="link-btn" id="back-to-import">${Icon.chevronLeft}${T.personForm.backToImport}</button>` : ''}
      <div class="field">
        <label>${T.personForm.name}</label>
        <input type="text" id="f-name" placeholder="${T.personForm.namePlaceholder}" value="${escapeHtml(state.name)}" />
        <div class="field-error" id="err-name" style="display:none">${T.personForm.nameRequired}</div>
      </div>

      <div class="field">
        <label>${T.personForm.phone}</label>
        <input type="tel" inputmode="numeric" id="f-phone" placeholder="0501234567" value="${escapeHtml(state.phone)}" />
        <div class="help" id="phone-preview">${T.personForm.phoneHelp}</div>
        <div id="cc-pick" style="display:none;margin-top:8px">
          <select id="f-cc" class="select" aria-label="${T.personForm.pickCountry}">
            <option value="">${T.personForm.pickCountry}</option>
            ${COUNTRIES.map((c) => `<option value="${c.cc}">${c.name} (+${c.cc})</option>`).join('')}
          </select>
        </div>
        <div class="field-error" id="err-phone" style="display:none">${T.personForm.phoneRequired}</div>
      </div>

      <div class="field">
        <label>${T.personForm.degree}</label>
        <div class="chip-group">
          ${DEGREES.map((d) => `
            <button type="button" class="chip deg-chip ${selectedDegree === d.id ? 'active' : ''}"
              data-id="${d.id}" style="${selectedDegree === d.id ? `background:${d.color}` : ''}">${d.name}</button>
          `).join('')}
        </div>
      </div>

      <div class="field">
        <label>${T.personForm.periodicity}</label>
        <input type="number" min="1" id="f-period" value="${state.periodicityDays}" />
        <div class="help">${T.personForm.periodicityHelp}</div>
      </div>

      <div class="field">
        <label>${T.personForm.note}</label>
        <textarea id="f-note" placeholder="${T.personForm.notePlaceholder}">${escapeHtml(state.note)}</textarea>
      </div>

      <div class="btn-row" style="margin-bottom:10px">
        <button class="btn btn-primary" id="btn-save">${Icon.check}${T.personForm.save}</button>
      </div>

      ${isEdit ? `
        <div class="btn-row" style="margin-bottom:10px">
          <button class="btn btn-outline" id="btn-archive">${Icon.archive}${person.archived ? T.personForm.unarchive : T.personForm.archive}</button>
        </div>
        <div class="btn-row">
          <button class="btn btn-danger-ghost" id="btn-delete">${Icon.trash}${T.personForm.delete}</button>
        </div>
      ` : ''}
    `);

    if (!isEdit) {
      document.getElementById('back-to-import').onclick = () => { importMode = true; paint(); };
    }
    document.getElementById('f-name').oninput = (e) => { state.name = e.target.value; };
    const updatePhonePreview = () => {
      const intl = toInternationalDigits(state.phone, getSetting('defaultCc'));
      const unresolved = intl.startsWith('0');
      document.getElementById('cc-pick').style.display = unresolved ? 'block' : 'none';
      document.getElementById('phone-preview').textContent = unresolved
        ? T.personForm.needsCountry
        : intl ? `${T.personForm.phonePreview} ‎+${intl}` : T.personForm.phoneHelp;
    };
    document.getElementById('f-cc').onchange = (e) => {
      if (e.target.value) { setSetting('defaultCc', e.target.value); updatePhonePreview(); }
    };
    updatePhonePreview();
    document.getElementById('f-phone').oninput = (e) => { state.phone = e.target.value; updatePhonePreview(); };
    document.getElementById('f-note').oninput = (e) => { state.note = e.target.value; };
    document.getElementById('f-period').oninput = (e) => {
      periodicityTouched = true;
      state.periodicityDays = Number(e.target.value) || 1;
    };

    document.querySelectorAll('.deg-chip').forEach((chip) => {
      chip.onclick = () => {
        selectedDegree = chip.dataset.id;
        if (!periodicityTouched) {
          state.periodicityDays = DEGREES.find((d) => d.id === selectedDegree).defaultPeriodicityDays;
        }
        paint();
      };
    });

    document.getElementById('btn-save').onclick = onSave;
    if (isEdit) {
      document.getElementById('btn-archive').onclick = async () => {
        await setArchived(person.id, !person.archived);
        toast(person.archived ? 'أُلغيت الأرشفة' : 'تمت الأرشفة');
        navigate('/people');
      };
      document.getElementById('btn-delete').onclick = onDelete;
    }
  }

  function paintImportChooser() {
    setScreen(`
      <p style="color:var(--ink-600);font-size:14px;margin:4px 0 18px;line-height:1.75">${T.personForm.importIntro}</p>
      <div class="import-options">
        ${contactPickerSupported ? `
        <button type="button" class="import-option" id="io-picker">
          ${iconChip(Icon.contactBook, 'clay', 'md')}
          <div class="io-text">
            <div class="io-title">${T.personForm.importPickTitle}</div>
            <div class="io-hint">${T.personForm.importPickHint}</div>
          </div>
          <div class="io-chevron">${Icon.chevronLeft}</div>
        </button>` : ''}
        <button type="button" class="import-option" id="io-vcard">
          ${iconChip(Icon.fileUp, 'sage', 'md')}
          <div class="io-text">
            <div class="io-title">${T.personForm.importVcardTitle}</div>
            <div class="io-hint">${T.personForm.importVcardHint}</div>
          </div>
          <div class="io-chevron">${Icon.chevronLeft}</div>
        </button>
      </div>
      <input type="file" id="vcard-input" accept=".vcf,text/vcard" style="display:none" />
      <div class="divider-text">${T.personForm.importManualDivider}</div>
      <button type="button" class="btn btn-outline" id="io-manual">${Icon.penLine}${T.personForm.manualEntry}</button>
    `);

    if (contactPickerSupported) {
      document.getElementById('io-picker').onclick = onPickContact;
    }
    document.getElementById('io-vcard').onclick = () => {
      document.getElementById('vcard-input').click();
    };
    document.getElementById('vcard-input').onchange = onVcardSelected;
    document.getElementById('io-manual').onclick = () => { importMode = false; paint(); };
  }

  async function onPickContact() {
    try {
      const [contact] = await navigator.contacts.select(['name', 'tel'], { multiple: false });
      if (!contact) return;
      if (contact.name?.[0]) state.name = contact.name[0];
      if (contact.tel?.[0]) state.phone = normalizePhone(contact.tel[0]);
      importMode = false;
      paint();
      toast(T.personForm.importedToast);
    } catch {
      // المستخدم أغلق نافذة الاختيار، أو رفض الإذن — لا حاجة لإزعاجه برسالة
    }
  }

  function onVcardSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const { name, phone } = parseVCard(String(reader.result || ''));
      if (!name && !phone) { toast(T.personForm.importFailed); }
      if (name) state.name = name;
      if (phone) state.phone = phone;
      importMode = false;
      paint();
      if (name || phone) toast(T.personForm.importedToast);
    };
    reader.readAsText(file);
  }

  async function onSave() {
    let ok = true;
    document.getElementById('err-name').style.display = 'none';
    document.getElementById('err-phone').style.display = 'none';

    if (!state.name.trim()) {
      document.getElementById('err-name').style.display = 'block';
      ok = false;
    }
    const digits = toInternationalDigits(state.phone, getSetting('defaultCc'));
    if (digits.length < 8 || digits.startsWith('0')) {
      document.getElementById('err-phone').style.display = 'block';
      ok = false;
    }
    if (!ok) return;

    const payload = {
      name: state.name.trim(),
      phone: toE164(digits),
      degreeId: selectedDegree,
      periodicityDays: state.periodicityDays,
      note: state.note.trim(),
    };

    if (isEdit) {
      await updatePerson(person.id, payload);
      toast('تم حفظ التعديلات');
      navigate(`/person/${person.id}`);
    } else {
      const created = await createPerson(payload);
      toast('تمت إضافة الشخص');
      navigate(`/person/${created.id}`);
    }
  }

  function onDelete() {
    openConfirmDelete(async () => {
      await deletePerson(person.id);
      navigate('/people');
    });
  }
}

function openConfirmDelete(onConfirm) {
  const backdrop = document.createElement('div');
  backdrop.className = 'sheet-backdrop';
  backdrop.innerHTML = `
    <div class="sheet">
      <div class="sheet-handle"></div>
      <div class="sheet-title">${T.personForm.delete}</div>
      <p style="color:var(--ink-600);font-size:14px;line-height:1.7;margin-bottom:20px">${T.personForm.deleteConfirm}</p>
      <div class="btn-row">
        <button class="btn btn-outline" id="c-cancel">${T.personForm.cancel}</button>
        <button class="btn btn-danger-ghost" id="c-ok">${T.personForm.delete}</button>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);
  backdrop.querySelector('#c-cancel').onclick = () => backdrop.remove();
  backdrop.querySelector('#c-ok').onclick = () => { backdrop.remove(); onConfirm(); };
}
