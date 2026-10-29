import { T, WELCOME_ITEMS, WELCOME_HOWTO } from '../content.js';
import { Illustration } from '../icons.js';
import { getSetting, setSetting } from '../settings.js';
import { escapeHtml, els } from '../ui.js';

// تظهر عند فتح التطبيق (مرة لكل جلسة)، ويمكن إيقافها من الإعدادات أو إعادة عرضها من «عن صِلة»
export function showWelcome({ force = false } = {}) {
  if (!force) {
    if (getSetting('showWelcome') === false) return;
    if (sessionStorage.getItem('sila.welcomed')) return;
  }
  sessionStorage.setItem('sila.welcomed', '1');

  const n = Number(getSetting('welcomeIndex') || 0);
  const item = WELCOME_ITEMS[n % WELCOME_ITEMS.length];
  setSetting('welcomeIndex', n + 1);

  const host = els.root.querySelector('.phone');
  const overlay = document.createElement('div');
  overlay.className = 'welcome';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-label', 'رسالة ترحيب');
  overlay.innerHTML = `
    <div class="welcome-scroll">
      <div class="welcome-art">${Illustration.connectHero}</div>
      <div class="welcome-kind">${escapeHtml(item.kind)}</div>
      <p class="welcome-text">«${escapeHtml(item.text)}»</p>
      <div class="welcome-source">${escapeHtml(item.source)}</div>
      <p class="welcome-explain">${escapeHtml(item.explain)}</p>
      <div class="welcome-howto">
        <div class="welcome-howto-title">${WELCOME_HOWTO.title}</div>
        <ol>${WELCOME_HOWTO.steps.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}</ol>
      </div>
      <div class="welcome-dev">${T.account.developer}</div>
    </div>
    <div class="welcome-actions">
      <button class="btn btn-primary" id="welcome-start">${WELCOME_HOWTO.start}</button>
    </div>
  `;
  host.appendChild(overlay);
  const close = () => { overlay.classList.add('out'); setTimeout(() => overlay.remove(), 220); };
  overlay.querySelector('#welcome-start').onclick = close;
  overlay.querySelector('#welcome-start').focus();
}
