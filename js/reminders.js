// تذكير يومي عبر تقويم الهاتف: ملف .ics يُضاف إلى التقويم فيُنبّه الهاتف نفسه كل يوم
// حتى والتطبيق مغلق، دون خادم ودون إذن إشعارات.

function pad(n) { return String(n).padStart(2, '0'); }

export function buildDailyReminderIcs(timeHHMM, appUrl) {
  const [h, m] = timeHHMM.split(':').map(Number);
  const now = new Date();
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;
  const start = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}T${pad(h)}${pad(m)}00`;
  const title = 'صِلة: من ينتظر تواصلك اليوم؟';
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Sila//AR',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    'UID:sila-daily-reminder@sila.app',
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    'DURATION:PT10M',
    'RRULE:FREQ=DAILY',
    `SUMMARY:${title}`,
    'DESCRIPTION:افتح صِلة لترى من يحتاج تواصلاً اليوم.',
    `URL:${appUrl}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${title}`,
    'TRIGGER:PT0M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n') + '\r\n';
}

function isNative() {
  return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
}

// في تطبيق الأندرويد لا تعمل روابط التنزيل، فنحفظ الملف ثم نفتح قائمة المشاركة/الحفظ
async function shareNative(content, filename) {
  const { Filesystem, Share } = window.Capacitor.Plugins;
  const written = await Filesystem.writeFile({ path: filename, data: content, directory: 'CACHE', encoding: 'utf8' });
  await Share.share({ title: filename, url: written.uri, dialogTitle: filename });
}

export function downloadBlob(content, filename, type) {
  if (isNative()) {
    shareNative(content, filename).catch(() => {});
    return;
  }
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
