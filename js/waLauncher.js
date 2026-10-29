// اختيار تطبيق واتساب (العادي أو للأعمال) عند وجود الاثنين على الهاتف.
// يعمل داخل تطبيق أندرويد فقط؛ في المتصفح نكتفي برابط wa.me.
import { getSetting, setSetting } from './settings.js';

export const WA_PACKAGES = { whatsapp: 'com.whatsapp', business: 'com.whatsapp.w4b' };

function plugin() {
  const c = typeof window !== 'undefined' ? window.Capacitor : null;
  if (!c || !c.isNativePlatform || !c.isNativePlatform()) return null;
  return c.Plugins && c.Plugins.WaLauncher ? c.Plugins.WaLauncher : null;
}

// {whatsapp: bool, business: bool} أو null خارج التطبيق
export async function getInstalledWa() {
  const p = plugin();
  if (!p) return null;
  try { return await p.installed(); } catch { return null; }
}

export function getWaChoice() {
  return getSetting('waApp') === 'business' ? 'business' : 'whatsapp';
}

export function setWaChoice(choice) {
  setSetting('waApp', choice === 'business' ? 'business' : 'whatsapp');
}

// يفتح الرابط في التطبيق المختار. يعيد false إن لم يتوفر ذلك فنرجع للطريقة العادية.
export async function openInWa(link, choice) {
  const p = plugin();
  if (!p) return false;
  try { await p.open({ url: link, package: WA_PACKAGES[choice] }); return true; } catch { return false; }
}
