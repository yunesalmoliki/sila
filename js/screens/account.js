import { Icon } from '../icons.js';
import { T } from '../content.js';
import { setTopbar, setScreen, hideTabbar, wireBack, toast, openSheet, iconChip, escapeHtml } from '../ui.js';
import { back } from '../router.js';
import { todayISO } from '../utils.js';
import { COUNTRIES, getSetting, setSetting } from '../settings.js';
import { buildDailyReminderIcs, downloadBlob } from '../reminders.js';
import * as local from '../data/localAdapter.js';
import * as sync from '../sync.js';
import { showWelcome } from './welcome.js';

const APP_URL = 'https://yunesalmoliki.github.io/sila/';

function dateLabel(iso) {
  return new Date(iso).toLocaleString('ar', { day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' });
}

function syncSectionHtml() {
  const info = sync.getSyncInfo();
  if (!info.enabled) {
    return `
      <p class="plain-note">${T.account.syncIntro}</p>
      <button class="btn btn-primary" id="btn-sync-enable">${Icon.cloudCheck}${T.account.syncEnable}</button>
      <button class="btn btn-outline" id="btn-sync-link" style="margin-top:10px">${Icon.penLine}${T.account.syncLink}</button>`;
  }
  return `
    <div class="import-option" style="cursor:default">
      ${iconChip(Icon.cloudCheck, 'sage', 'md')}
      <div class="io-text">
        <div class="io-title">${T.account.syncActive}</div>
        <div class="io-hint" id="sync-last">${info.lastSyncAt ? T.account.syncLast(dateLabel(info.lastSyncAt)) : T.account.syncNever}</div>
      </div>
    </div>
    <button class="btn btn-primary" id="btn-sync-now" style="margin-top:10px">${Icon.history}${T.account.syncNow}</button>
    <div class="btn-row" style="margin-top:10px">
      <button class="btn btn-outline" id="btn-sync-code">${T.account.syncShowCode}</button>
      <button class="btn btn-outline" id="btn-sync-disable">${T.account.syncDisable}</button>
    </div>`;
}

export async function renderAccount() {
  hideTabbar();
  setTopbar(`
    <button class="icon-btn" id="btn-back" aria-label="رجوع">${Icon.back}</button>
    <h1>${T.account.title}</h1>
  `);
  wireBack(() => back());

  setScreen(`
    <div class="section-title" style="margin-top:4px">${T.account.syncTitle}</div>
    <div id="sync-section">${syncSectionHtml()}</div>

    <div class="section-title">${T.account.settingsTitle}</div>
    <div class="field">
      <label for="f-country">${T.account.countryLabel}</label>
      <select id="f-country" class="select">
        <option value="">${T.account.countryNone}</option>
        ${COUNTRIES.map((c) => `<option value="${c.cc}" ${c.cc === getSetting('defaultCc') ? 'selected' : ''}>${c.name} (+${c.cc})</option>`).join('')}
      </select>
    </div>
    <label class="toggle-row">
      <input type="checkbox" id="f-welcome" ${getSetting('showWelcome') === false ? '' : 'checked'} />
      <span>${T.account.welcomeToggle}</span>
    </label>

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

    <div class="section-title">${T.account.shareTitle}</div>
    <p class="plain-note">${T.account.shareIntro}</p>
    <button class="btn btn-outline" id="btn-share">${Icon.whatsapp}${T.account.shareBtn}</button>

    <div class="section-title">${T.account.aboutTitle}</div>
    <button class="btn btn-ghost" id="btn-about">${Icon.sparkle}${T.account.aboutOpen}</button>
    <p class="plain-note" style="text-align:center;margin-top:18px;font-weight:600">${T.account.developer}</p>
  `);

  wireSync();
  document.getElementById('f-country').onchange = (e) => setSetting('defaultCc', e.target.value);
  document.getElementById('f-welcome').onchange = (e) => setSetting('showWelcome', e.target.checked);
  document.getElementById('f-remind-time').onchange = (e) => setSetting('reminderTime', e.target.value);
  document.getElementById('btn-reminder').onclick = onAddReminder;
  wireInstall();
  document.getElementById('btn-backup-download').onclick = onDownloadBackup;
  document.getElementById('btn-backup-restore').onclick = () => document.getElementById('backup-file-input').click();
  document.getElementById('backup-file-input').onchange = onRestoreBackup;
  document.getElementById('btn-share').onclick = onShare;
  document.getElementById('btn-about').onclick = () => showWelcome({ force: true });
}

function refreshSyncSection() {
  document.getElementById('sync-section').innerHTML = syncSectionHtml();
  wireSync();
}

function reasonToast(reason) {
  const map = {
    invalid: T.account.syncInvalid,
    'not-found': T.account.syncNotFound,
    'bad-code': T.account.syncBadCode,
    busy: T.account.syncBusy,
    offline: T.account.syncOffline,
  };
  toast(map[reason] || T.account.syncOffline);
}

function wireSync() {
  const el = (id) => document.getElementById(id);
  if (el('btn-sync-enable')) el('btn-sync-enable').onclick = onEnableSync;
  if (el('btn-sync-link')) el('btn-sync-link').onclick = openLinkSheet;
  if (el('btn-sync-now')) {
    el('btn-sync-now').onclick = async () => {
      const r = await sync.syncNow();
      if (r.ok) { toast(T.account.syncDone); refreshSyncSection(); } else reasonToast(r.reason);
    };
  }
  if (el('btn-sync-code')) el('btn-sync-code').onclick = () => openCodeSheet(sync.getSyncInfo().secret);
  if (el('btn-sync-disable')) el('btn-sync-disable').onclick = openDisableSheet;
}

async function onEnableSync() {
  const btn = document.getElementById('btn-sync-enable');
  btn.disabled = true;
  const r = await sync.enableSync();
  if (!r.ok) {
    btn.disabled = false;
    reasonToast(r.reason);
    return;
  }
  refreshSyncSection();
  openCodeSheet(r.secret);
}

function openCodeSheet(secret) {
  const code = sync.formatSecret(secret);
  openSheet(`
    <div class="sheet-handle"></div>
    <div class="sheet-title">${T.account.syncCodeTitle}</div>
    <div class="code-box" id="code-box" dir="ltr">${code}</div>
    <p class="plain-note">${T.account.syncCodeHint}</p>
    <div class="btn-row">
      <button class="btn btn-outline" id="code-close">${T.common.close}</button>
      <button class="btn btn-primary" id="code-copy">${Icon.copy}${T.account.syncCopy}</button>
    </div>
  `, {
    onMount(sheetEl, close) {
      sheetEl.querySelector('#code-close').onclick = close;
      sheetEl.querySelector('#code-copy').onclick = async () => {
        try { await navigator.clipboard.writeText(code); } catch { /* يُنسخ يدويًا */ }
        toast(T.account.syncCopied);
      };
    },
  });
}

function openLinkSheet() {
  openSheet(`
    <div class="sheet-handle"></div>
    <div class="sheet-title">${T.account.syncLinkTitle}</div>
    <p class="plain-note" style="margin-top:-8px">${T.account.syncLinkHint}</p>
    <div class="field">
      <input type="text" id="link-code" dir="ltr" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="${T.account.syncLinkPlaceholder}" style="text-align:center;letter-spacing:1px" />
    </div>
    <button class="btn btn-primary" id="link-go">${Icon.check}${T.account.syncLinkCta}</button>
  `, {
    onMount(sheetEl, close) {
      sheetEl.querySelector('#link-go').onclick = async () => {
        const go = sheetEl.querySelector('#link-go');
        go.disabled = true;
        const r = await sync.linkWithCode(sheetEl.querySelector('#link-code').value);
        go.disabled = false;
        if (!r.ok) { reasonToast(r.reason); return; }
        close();
        toast(T.account.syncLinkedToast);
        refreshSyncSection();
      };
    },
  });
}

function openDisableSheet() {
  openSheet(`
    <div class="sheet-handle"></div>
    <div class="sheet-title">${T.account.syncDisableTitle}</div>
    <p class="plain-note">${T.account.syncDisableBody}</p>
    <button class="btn btn-outline" id="dis-keep">${T.account.syncDisableKeep}</button>
    <button class="btn btn-danger-ghost" id="dis-delete" style="margin-top:10px">${Icon.trash}${T.account.syncDisableDelete}</button>
  `, {
    onMount(sheetEl, close) {
      sheetEl.querySelector('#dis-keep').onclick = () => { sync.disableSync(); close(); toast(T.account.syncDisabledToast); refreshSyncSection(); };
      sheetEl.querySelector('#dis-delete').onclick = async () => {
        await sync.deleteCloudCopy();
        sync.disableSync();
        close();
        toast(T.account.syncDisabledToast);
        refreshSyncSection();
      };
    },
  });
}

async function onShare() {
  const data = { title: 'صِلة', text: T.account.shareText, url: APP_URL };
  if (navigator.share) {
    try { await navigator.share(data); } catch { /* أُلغيت المشاركة */ }
    return;
  }
  try { await navigator.clipboard.writeText(`${data.text} ${data.url}`); } catch { /* لا نسخ */ }
  toast(T.account.linkCopied);
}

function lastBackupLabel() {
  const at = getSetting('lastBackupAt');
  if (!at) return T.account.neverBackedUp;
  return T.account.lastBackup(new Date(at).toLocaleDateString('ar', { day: 'numeric', month: 'long' }));
}

function onAddReminder() {
  const time = document.getElementById('f-remind-time').value || '20:00';
  setSetting('reminderTime', time);
  downloadBlob(buildDailyReminderIcs(time, APP_URL), 'sila-reminder.ics', 'text/calendar;charset=utf-8');
  toast(T.account.reminderDone);
}

function wireInstall() {
  const note = document.getElementById('install-note');
  const btn = document.getElementById('btn-install');
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone
    || (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
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

function onDownloadBackup() {
  setSetting('lastBackupAt', new Date().toISOString());
  const payload = local.exportBackup();
  downloadBlob(JSON.stringify(payload, null, 2), `sila-backup-${todayISO()}.json`, 'application/json');
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
    <p class="plain-note">${T.account.backupRestoreConfirmBody}</p>
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
        setTimeout(() => location.reload(), 400);
      };
    },
  });
}
