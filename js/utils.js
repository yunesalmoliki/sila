// دوال مساعدة عامة: التاريخ، الحساب، وصياغة اللغة العربية.

const DAY_MS = 24 * 60 * 60 * 1000;

export function uid() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function todayISO() {
  return dateToISO(new Date());
}

export function dateToISO(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function daysBetween(fromISO, toISO) {
  const a = new Date(fromISO + 'T00:00:00');
  const b = new Date(toISO + 'T00:00:00');
  return Math.round((b - a) / DAY_MS);
}

export function addDays(iso, days) {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return dateToISO(d);
}

// صياغة عدد مع اسم بحسب قواعد العربية: مفرد / مثنى / جمع قليل (٣-١٠) / جمع كثير (١١+)
function arabicCount(n, forms) {
  const { one, two, few, many } = forms;
  if (n === 1) return one;
  if (n === 2) return two;
  if (n >= 3 && n <= 10) return `${toArabicDigits(n)} ${few}`;
  return `${toArabicDigits(n)} ${many}`;
}

export function toArabicDigits(n) {
  return String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
}

const UNIT_FORMS = {
  day: { one: 'يوم', two: 'يومين', few: 'أيام', many: 'يوماً' },
  week: { one: 'أسبوع', two: 'أسبوعين', few: 'أسابيع', many: 'أسبوعاً' },
  month: { one: 'شهر', two: 'شهرين', few: 'أشهر', many: 'شهراً' },
  year: { one: 'سنة', two: 'سنتين', few: 'سنوات', many: 'سنة' },
};

// يحوّل عدد الأيام إلى أقرب وحدة زمنية مفهومة، بصياغة عربية صحيحة
export function humanDuration(days) {
  if (days <= 0) return 'اليوم';
  if (days < 14) return arabicCount(days, UNIT_FORMS.day);
  if (days < 60) return arabicCount(Math.round(days / 7), UNIT_FORMS.week);
  if (days < 365) return arabicCount(Math.round(days / 30), UNIT_FORMS.month);
  return arabicCount(Math.round(days / 365), UNIT_FORMS.year);
}

// صياغة "منذ كذا" لعرض المدة منذ تاريخ ماضٍ، مع معالجة خاصة لليوم نفسه
export function sinceLabel(days) {
  if (days <= 0) return 'اليوم';
  return `منذ ${humanDuration(days)}`;
}

export function firstName(fullName) {
  return (fullName || '').trim().split(/\s+/)[0] || fullName;
}

export function normalizePhone(raw) {
  return (raw || '').replace(/\D/g, '');
}

// صيغة تخزين موحّدة (E.164) حتى يُعتبر نفس الرقم دائمًا نفس القيمة بصرف النظر
// عن شكل كتابته الأصلي — لا تؤثر على wa.me لأن buildWaLink يجرّد الرمز أصلًا
export function toE164(raw) {
  const digits = normalizePhone(raw);
  return digits ? `+${digits}` : '';
}

// لعرض الرقم في حقل إدخال يطلب من المستخدم عدم كتابة "+" بنفسه
export function stripE164(raw) {
  return (raw || '').replace(/^\+/, '');
}

export function buildWaLink(phone, text) {
  const digits = normalizePhone(phone);
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

// تحليل مبسّط لملف بطاقة جهة اتصال (vCard) لاستخراج الاسم والهاتف فقط
export function parseVCard(text) {
  const lines = String(text || '').split(/\r\n|\r|\n/);
  let name = '';
  let phone = '';
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!name && /^FN[:;]/i.test(line)) {
      name = line.split(':').slice(1).join(':').trim();
    }
    if (!name && /^N[:;]/i.test(line)) {
      const parts = line.split(':').slice(1).join(':').split(';');
      name = [parts[1], parts[0]].filter(Boolean).join(' ').trim();
    }
    if (!phone && /^TEL[:;]/i.test(line)) {
      phone = normalizePhone(line.split(':').slice(1).join(':'));
    }
  }
  return { name, phone };
}

export function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

// يحوّل رقمًا كما يكتبه الناس (0501234567 أو +966… أو 00966…) إلى أرقام دولية صالحة لواتساب.
// defaultCc: رمز دولة المستخدم بلا + (مثال: 966). إن لم يُعرَف يُترك الرقم كما هو.
export function toInternationalDigits(raw, defaultCc = '') {
  const hadPlus = /^\s*\+/.test(raw || '');
  let digits = normalizePhone(raw);
  if (!digits) return '';
  if (digits.startsWith('00')) return digits.slice(2);
  if (hadPlus || !defaultCc) return digits;
  if (digits.startsWith(defaultCc) && digits.length >= defaultCc.length + 8) return digits;
  if (digits.startsWith('0')) return defaultCc + digits.replace(/^0+/, '');
  if (digits.length <= 9) return defaultCc + digits;
  return digits;
}
