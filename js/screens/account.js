import { Icon } from '../icons.js';
import { T } from '../content.js';
import { setTopbar, setScreen, hideTabbar, wireBack, toast, openSheet, iconChip, escapeHtml } from '../ui.js';
import { navigate, back } from '../router.js';
import { setMode } from '../db.js';
import { todayISO } from '../utils.js';
import { COUNTRIES, getSetting, setSetting } from '../settings.js';
import { buildDailyReminderIcs, downloadBlob } from '../reminders.js';
import * as local from '../data/localAdapter.js';
import * as cloud from '../data/cloudAdapter.js';

export async function renderAccount() {
  hideTabbar();
  setTopbar(`
    <button class="icon-btn" id="btn-back" aria-label="رجوع">${Icon.back}</button>
    <h1>${T.account.title}</h1>
  `);
  wireBack(() => back());

  const configured = cloud.isConfigured();
  const user = configured ? cloud.currentUser() : null;

  setScreen(`
    <div class="section-title" style="margin-top:4px">${T.account.syncTitle}</div>
    ${!configured ? `
      <div class="hint-box">${T.account.syncUnavailable}</div>
    ` : user ? `
      <div class="import-option" style="cursor:default">
        ${iconChip(Icon.cloudCheck, 'sage', 'md')}
        <div class="io-text">
          <div class="io-title">${escapeHtml(T.account.signedInAs(user.email || ''))}</div>
        </div>
      </div>
      <button class="btn btn-outline" id="btn-signout" style="margin-top:10px">${Icon.back}${T.account.signOut}</button>
    ` : `
      <p style="color:var(--ink-600);font-size:14px;line-height:1.75;margin:4px 0 14px">${T.account.syncIntro}</p>
      <button class="btn btn-primary" id="btn-google">${Icon.google}${T.account.signInGoogle}</button>
    `}

    <div class="section-title">${T.account.settingsTitle}</div>
    <div class="field">
      <label for="f-country">${T.account.countryLabel}</label>
      <select id="f-country" class="select">
        <option value="">${T.account.countryNone}</option>
        ${COUNTRIES.map((c) => `<option value="${c.cc}" ${c.cc === getSetting('defaultCc') ? 'selected' : ''}>${c.name} (+${c.cc})</option>`).join('')}
      </select>
    </div>

    <div class="section-title">${T.account.reminderTitle}</div>
    <p class="plain-note">${T.account.reminderIntro}</p>
    <div class="field">
      <label for="f-remind-time">${T.account.reminderTime}</label>
      <input type="time" id="f-remind-time" value="${getSetting('reminderTime') || '20:00'}" />
    </div>
    <button class="btn btn-outline" id="btn-reminder">${Icon.calendar}${T.account.reminderAdd}</button>

    <div class="section-title">${T.account.installTitle}</div>
    <p class="plain-note" id="install-note">${T.account.installIntro}</p>
    <button class="btn btn-outline" id="btn-install" style="display:none">${Icon.download}${T.account.installNow}</button>

    <div class="section-title">${T.account.backupTitle}</div>
    <p class="plain-note">${T.account.backupIntro}</p>
    <p class="plain-note" style="margin-top:-6px;font-weight:600">${lastBackupLabel()}</p>
    <div class="btn-row" style="margin-bottom:10px">
      <button class="btn btn-outline" id="btn-backup-download">${Icon.download}${T.account.backupDownload}</button>
    </div>
    <button class="btn btn-outline" id="btn-backup-restore">${Icon.upload}${T.account.backupRestore}</button>
    <input type="file" id="backup-file-input" accept="application/json" style="display:none" />
  `);

  if (configured && !user) {
    document.getElementById('btn-google').onclick = onSignIn;
  }
  if (configured && user) {
    document.getElementById('btn-signout').onclick = onSignOut;
  }
  document.getElementById('f-country').onchange = (e) => setSetting('defaultCc', e.target.value);
  document.getElementById('f-remind-time').onchange = (e) => setSetting('reminderTime', e.target.value);
  document.getElementById('btn-reminder').onclick = onAddReminder;
  wireInstall();
  document.getElementById('btn-backup-download').onclick = onDownloadBackup;
  document.getElementById('btn-backup-restore').onclick = () => document.getElementById('backup-file-input').click();
  document.getElementById('backup-file-input').onchange = onRestoreBackup;
}

function lastBackupLabel() {
  const at = getSetting('lastBackupAt');
  if (!at) return T.account.neverBackedUp;
  return T.account.lastBackup(new Date(at).toLocaleDateString('ar', { day: 'numeric', month: 'long' }));
}

function onAddReminder() {
  const time = document.getElementById('f-remind-time').value || '20:00';
  setSetting('reminderTime', time);
  const appUrl = location.origin + location.pathname;
  downloadBlob(buildDailyReminderIcs(time, appUrl), 'sila-reminder.ics', 'text/calendar;charset=utf-8');
  toast(T.account.reminderDone);
}

function wireInstall() {
  const note = document.getElementById('install-note');
  const btn = document.getElementById('btn-install');
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (standalone) {
    note.textContent = T.account.installDone;
    return;
  }
  if (window.__silaInstallPrompt) {
    btn.style.display = '';
    btn.onclick = async () => {
      const ev = window.__silaInstallPrompt;
      ev.prompt();
      await ev.userChoice;
      window.__silaInstallPrompt = null;
      btn.style.display = 'none';
    };
    return;
  }
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  note.textContent = isIos ? T.account.installIos : T.account.installOther;
}

async function onSignIn() {
  try {
    await cloud.signInWithGoogle();
  } catch {
    toast(T.account.signInFailed);
    return;
  }
  await reconcileAfterSignIn();
}

async function reconcileAfterSignIn() {
  const localPeople = await local.getAllPeople({ includeArchived: true });
  const cloudPeople = await cloud.getAllPeople({ includeArchived: true });

  if (localPeople.length === 0) {
    setMode('cloud');
    toast('تم تسجيل الدخول');
    location.reload();
    return;
  }

  if (cloudPeople.length === 0) {
    openUploadConfirm(localPeople);
    return;
  }

  openMergeChoice(localPeople);
}

function openUploadConfirm(localPeople) {
  const totalLogs = localPeople.reduce((sum, p) => sum + local.getLogsForPerson(p.id).length, 0);
  openSheet(`
    <div class="sheet-handle"></div>
    <div class="sheet-title">${T.account.uploadConfirmTitle}</div>
    <p style="color:var(--ink-600);font-size:14px;line-height:1.75;margin-bottom:20px">${T.account.uploadConfirmBody(localPeople.length, totalLogs)}</p>
    <div class="btn-row">
      <button class="btn btn-outline" id="up-cancel">${T.personForm.cancel}</button>
      <button class="btn btn-primary" id="up-ok">${T.account.uploadConfirmCta}</button>
    </div>
  `, {
    onMount(sheetEl, close) {
      sheetEl.querySelector('#up-cancel').onclick = close;
      sheetEl.querySelector('#up-ok').onclick = async () => {
        close();
        await doUpload(localPeople);
      };
    },
  });
}

async function doUpload(localPeople) {
  const logsByPerson = {};
  for (const p of localPeople) logsByPerson[p.id] = await local.getLogsForPerson(p.id);
  try {
    await cloud.migrateLocalData(localPeople, logsByPerson);
  } catch {
    toast(T.account.uploadFailed);
    return;
  }
  setMode('cloud');
  toast(T.account.uploadSuccess);
  location.reload();
}

function openMergeChoice(localPeople) {
  openSheet(`
    <div class="sheet-handle"></div>
    <div class="sheet-title">${T.account.mergeTitle}</div>
    <p style="color:var(--ink-600);font-size:14px;line-height:1.75;margin-bottom:16px">${T.account.mergeBody}</p>
    <button type="button" class="import-option" id="merge-combine" style="margin-bottom:10px">
      ${iconChip(Icon.cloudCheck, 'sage', 'md')}
      <div class="io-text">
        <div class="io-title">${T.account.mergeCombine}</div>
        <div class="io-hint">${T.account.mergeCombineHint}</div>
      </div>
    </button>
    <button type="button" class="import-option" id="merge-discard">
      ${iconChip(Icon.trash, 'amber', 'md')}
      <div class="io-text">
        <div class="io-title">${T.account.mergeDiscard}</div>
        <div class="io-hint">${T.account.mergeDiscardHint}</div>
      </div>
    </button>
  `, {
    onMount(sheetEl, close) {
      sheetEl.querySelector('#merge-combine').onclick = async () => {
        close();
        await doUpload(localPeople);
      };
      sheetEl.querySelector('#merge-discard').onclick = () => {
        close();
        openConfirmDiscard();
      };
    },
  });
}

function openConfirmDiscard() {
  openSheet(`
    <div class="sheet-handle"></div>
    <div class="sheet-title">${T.account.mergeDiscard}</div>
    <p style="color:var(--danger);font-size:14px;line-height:1.75;margin-bottom:20px">${T.account.mergeDiscardConfirm}</p>
    <div class="btn-row">
      <button class="btn btn-outline" id="d-cancel">${T.personForm.cancel}</button>
      <button class="btn btn-danger-ghost" id="d-ok">${T.account.mergeDiscard}</button>
    </div>
  `, {
    onMount(sheetEl, close) {
      sheetEl.querySelector('#d-cancel').onclick = close;
      sheetEl.querySelector('#d-ok').onclick = () => {
        close();
        setMode('cloud');
        location.reload();
      };
    },
  });
}

async function onSignOut() {
  await cloud.signOutUser();
  setMode('local');
  location.reload();
}

function onDownloadBackup() {
  setSetting('lastBackupAt', new Date().toISOString());
  const payload = local.exportBackup();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sila-backup-${todayISO()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast(T.account.backupDownloaded);
}

function onRestoreBackup(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    let data;
    try { data = JSON.parse(String(reader.result || '')); } catch { data = null; }
    if (!data || !Array.isArray(data.people) || !Array.isArray(data.contactLogs)) {
      toast(T.account.backupInvalid);
      return;
    }
    openRestoreConfirm(data);
  };
  reader.readAsText(file);
}

function openRestoreConfirm(data) {
  openSheet(`
    <div class="sheet-handle"></div>
    <div class="sheet-title">${T.account.backupRestoreConfirmTitle}</div>
    <p style="color:var(--ink-600);font-size:14px;line-height:1.75;margin-bottom:20px">${T.account.backupRestoreConfirmBody}</p>
    <div class="btn-row">
      <button class="btn btn-outline" id="r-cancel">${T.personForm.cancel}</button>
      <button class="btn btn-danger-ghost" id="r-ok">${T.account.backupRestoreConfirmCta}</button>
    </div>
  `, {
    onMount(sheetEl, close) {
      sheetEl.querySelector('#r-cancel').onclick = close;
      sheetEl.querySelector('#r-ok').onclick = () => {
        close();
        local.importBackup(data);
        toast(T.account.backupRestored);
        location.reload();
      };
    },
  });
}
