// إعدادات المستخدم المحلية الصغيرة (لا علاقة لها بسجل الأشخاص).

const KEY = 'sila.settings.v1';

export const COUNTRIES = [
  { cc: '966', name: 'السعودية' },
  { cc: '971', name: 'الإمارات' },
  { cc: '965', name: 'الكويت' },
  { cc: '974', name: 'قطر' },
  { cc: '973', name: 'البحرين' },
  { cc: '968', name: 'عُمان' },
  { cc: '967', name: 'اليمن' },
  { cc: '964', name: 'العراق' },
  { cc: '963', name: 'سوريا' },
  { cc: '962', name: 'الأردن' },
  { cc: '961', name: 'لبنان' },
  { cc: '970', name: 'فلسطين' },
  { cc: '20', name: 'مصر' },
  { cc: '249', name: 'السودان' },
  { cc: '218', name: 'ليبيا' },
  { cc: '216', name: 'تونس' },
  { cc: '213', name: 'الجزائر' },
  { cc: '212', name: 'المغرب' },
  { cc: '90', name: 'تركيا' },
  { cc: '44', name: 'بريطانيا' },
  { cc: '1', name: 'أمريكا / كندا' },
];

const TZ_TO_CC = {
  'Asia/Riyadh': '966', 'Asia/Dubai': '971', 'Asia/Muscat': '968', 'Asia/Kuwait': '965',
  'Asia/Qatar': '974', 'Asia/Bahrain': '973', 'Asia/Aden': '967', 'Asia/Baghdad': '964',
  'Asia/Damascus': '963', 'Asia/Amman': '962', 'Asia/Beirut': '961', 'Asia/Gaza': '970',
  'Asia/Hebron': '970', 'Africa/Cairo': '20', 'Africa/Khartoum': '249', 'Africa/Tripoli': '218',
  'Africa/Tunis': '216', 'Africa/Algiers': '213', 'Africa/Casablanca': '212', 'Europe/Istanbul': '90',
};

function detectCountry() {
  try {
    return TZ_TO_CC[Intl.DateTimeFormat().resolvedOptions().timeZone] || '';
  } catch {
    return '';
  }
}

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

export function getSetting(name) {
  const s = load();
  if (name === 'defaultCc' && s.defaultCc === undefined) return detectCountry();
  return s[name];
}

export function setSetting(name, value) {
  const s = load();
  s[name] = value;
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* الامتلاء نادر؛ لا نكسر التطبيق */ }
}
