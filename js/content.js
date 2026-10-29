// كل النصوص العربية الظاهرة في التطبيق مجمّعة هنا، بعيداً عن منطق الكود.

export const APP_NAME = 'صِلة';

export const T = {
  nav: {
    home: 'الرئيسية',
    people: 'الأشخاص',
    add: 'إضافة',
  },
  home: {
    title: 'من يحتاج تواصلاً اليوم',
    subtitle: (n) => `${n} ${n === 1 ? 'شخص ينتظر' : n === 2 ? 'شخصان ينتظران' : n >= 3 && n <= 10 ? 'أشخاص ينتظرون' : 'شخصاً ينتظرون'} تواصلك`,
    emptyTitle: 'لا أحد ينتظرك اليوم',
    emptySubtitle: 'أحسنت الوصل',
    firstRunTitle: 'أهلاً بك في صِلة',
    firstRunBody: 'أضف أول شخص تريد أن يذكّرك التطبيق به عند طول غيابه عنه.',
    firstRunCta: 'أضف أول شخص',
    since: 'منذ',
  },
  people: {
    title: 'كل الأشخاص',
    searchPlaceholder: 'ابحث بالاسم',
    emptyTitle: 'لا يوجد أحد بعد',
    emptySubtitle: 'ابدأ بإضافة من تريد أن تبقى على صلة به',
    archivedToggleShow: 'عرض المؤرشَفين',
    archivedToggleHide: 'إخفاء المؤرشَفين',
    archivedBadge: 'مؤرشَف',
  },
  personForm: {
    titleAdd: 'إضافة شخص',
    titleEdit: 'تعديل بيانات',
    name: 'الاسم',
    namePlaceholder: 'مثال: خالتي منيرة',
    phone: 'رقم واتساب',
    phoneHelp: 'اكتب الرقم كما تعرفه (0501234567) أو بالصيغة الدولية، وسنجهّزه لواتساب تلقائيًا.',
    phonePreview: 'سيُستخدم الرقم:',
    degree: 'درجة القرابة',
    periodicity: 'كل كم يوم تريد التواصل معه',
    periodicityHelp: 'يقترح التطبيق مدة مناسبة لدرجة القرابة، ويمكنك تغييرها',
    note: 'ملاحظة (اختياري)',
    notePlaceholder: 'أي شيء تحب أن تتذكره عن هذا الشخص',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    archive: 'أرشفة',
    unarchive: 'إلغاء الأرشفة',
    deleteConfirm: 'سيُحذف هذا الشخص وكل سجل تواصله. هذا الإجراء لا يمكن التراجع عنه.',
    nameRequired: 'اكتب الاسم أولاً',
    phoneRequired: 'اكتب رقم واتساب صحيحاً',
    importPickTitle: 'اختيار من جهات الاتصال',
    importPickHint: 'يفتح قائمة جهات اتصال جهازك لاختيار شخص',
    importPickUnavailable: 'غير متاح على هذا المتصفح — يعمل حالياً على أندرويد (كروم)',
    importVcardTitle: 'استيراد بطاقة جهة اتصال',
    importVcardHint: 'على آيفون: افتح جهة الاتصال ← مشاركة ← حفظ كملف، ثم اخترها هنا',
    importManualDivider: 'أو أدخل البيانات يدوياً',
    importedFrom: 'تم الاستيراد',
    importFailed: 'تعذّر قراءة بيانات جهة الاتصال، أكمل يدوياً',
    manualEntry: 'إدخال البيانات يدوياً',
    backToImport: 'رجوع لخيارات الاستيراد',
    importIntro: 'لتسهيل الإضافة، اختر جهة الاتصال من هاتفك، أو أدخل بياناته يدوياً.',
    importedToast: 'تم استيراد البيانات، راجعها ثم احفظ',
  },
  personDetail: {
    lastContact: 'آخر تواصل',
    never: 'لم يسبق التواصل',
    nextDue: 'الموعد القادم',
    overdueBy: (n) => `متأخر ${n} ${n === 1 ? 'يوم' : n === 2 ? 'يومين' : n >= 3 && n <= 10 ? 'أيام' : 'يوماً'}`,
    dueToday: 'موعده اليوم',
    notDueYet: 'لم يحن موعده بعد',
    messageBtn: 'رسالة',
    logBtn: 'تسجيل تواصل',
    editBtn: 'تعديل',
    timelineTitle: 'سجل التواصل',
    timelineEmpty: 'لا يوجد سجل تواصل بعد',
    noteLabel: 'ملاحظة',
    snoozeBtn: 'تأجيل',
    snoozeTitle: 'تأجيل التذكير',
    snoozeHint: 'سيختفي من قائمة اليوم حتى الموعد الذي تختاره.',
    snoozeOptions: [
      { days: 1, label: 'غدًا' },
      { days: 3, label: 'بعد ٣ أيام' },
      { days: 7, label: 'بعد أسبوع' },
      { days: 14, label: 'بعد أسبوعين' },
    ],
    snoozedUntil: (d) => `مؤجَّل حتى ${d}`,
    snoozeCancel: 'إلغاء التأجيل',
    snoozeDone: 'تم التأجيل',
  },
  message: {
    title: 'اختر رسالة',
    customOption: 'رسالة من عندي',
    lastNoteHint: 'آخر ما تحدثتما عنه:',
    editorTitle: 'الرسالة',
    openWhatsapp: 'فتح واتساب',
    copyText: 'نسخ نص الرسالة',
    copied: 'نُسخ النص',
    noWhatsappTitle: 'تعذّر فتح واتساب',
    noWhatsappBody: 'تأكد من تثبيت واتساب على جهازك، أو انسخ نص الرسالة وأرسله بنفسك.',
    textareaPlaceholder: 'اكتب رسالتك هنا',
    confirmTitle: 'فتح واتساب بهذه الرسالة؟',
    confirmHint: 'ستُفتح محادثة',
    confirmBack: 'تراجع',
    noPhone: 'لا يوجد رقم واتساب صالح لهذا الشخص. عدّل بياناته لإضافة رقم.',
  },
  backupNudge: {
    text: 'احفظ نسخة احتياطية من بياناتك حتى لا تضيع إن تغيّر جهازك.',
    cta: 'حفظ الآن',
    later: 'لاحقًا',
  },
  confirmContact: {
    question: (name) => `هل تواصلت مع ${name}؟`,
    yes: 'نعم',
    notYet: 'ليس بعد',
  },
  logContact: {
    title: 'تسجيل تواصل',
    type: 'نوع التواصل',
    types: {
      message: 'رسالة',
      call: 'اتصال',
      meeting: 'لقاء',
      visit: 'زيارة',
    },
    date: 'التاريخ',
    note: 'ملاحظة عمّا دار في الحديث (اختياري)',
    notePlaceholder: 'اختياري',
    save: 'حفظ',
    savedToast: 'تم تسجيل التواصل، أحسنت',
  },
  degrees: {
    closest: 'الدائرة الأقرب',
    family: 'الأهل',
    friends: 'الأصدقاء المقرّبون',
    acquaintances: 'المعارف والزملاء',
  },
  common: {
    back: 'رجوع',
    close: 'إغلاق',
    today: 'اليوم',
    days: 'يوم',
  },
  account: {
    title: 'الحساب والبيانات',
    syncTitle: 'المزامنة بين أجهزتك',
    syncIntro: 'احفظ بياناتك وزامنها تلقائيًا بين هاتفك وأي جهاز آخر.',
    signInGoogle: 'المتابعة بحساب جوجل',
    signInFailed: 'تعذّر تسجيل الدخول، حاول مرة أخرى',
    syncUnavailable: 'بياناتك محفوظة بأمان على هذا الجهاز فقط. احتفظ بنسخة احتياطية من حين لآخر، وسنضيف المزامنة بين الأجهزة لاحقًا.',
    signedInAs: (email) => `متصل بحساب ${email}`,
    signOut: 'تسجيل الخروج',
    signOutConfirm: 'ستبقى بياناتك محفوظة في حسابك، ويمكنك الدخول للوصول إليها مجددًا في أي وقت.',
    uploadConfirmTitle: 'رفع بياناتك إلى حسابك',
    uploadConfirmBody: (people, logs) => `سيُرفع ${people} من الأشخاص و${logs} من سجلات التواصل إلى حسابك.`,
    uploadConfirmCta: 'رفع الآن',
    uploadSuccess: 'تم رفع بياناتك بنجاح',
    uploadFailed: 'تعذّر الرفع، تحقّق من الاتصال وحاول مرة أخرى',
    mergeTitle: 'وجدنا بيانات في مكانين',
    mergeBody: 'يوجد على هذا الجهاز أشخاص لم يُرفعوا بعد، وأيضًا بيانات محفوظة مسبقًا في حسابك.',
    mergeCombine: 'دمج البيانات',
    mergeCombineHint: 'يُضاف كل شخص جديد على هذا الجهاز إلى حسابك، بلا تكرار لمن هو موجود أصلًا',
    mergeDiscard: 'تجاهل بيانات هذا الجهاز',
    mergeDiscardHint: 'استخدام بيانات الحساب فقط — لا رجوع بعدها لبيانات هذا الجهاز',
    mergeDiscardConfirm: 'سيُهمَل نهائيًا كل ما أضفته على هذا الجهاز قبل الدخول. متأكد؟',
    mergeSuccess: 'تم الدمج بنجاح',
    settingsTitle: 'إعدادات',
    countryLabel: 'دولتك (لتجهيز أرقام واتساب تلقائيًا)',
    countryNone: 'غير محددة',
    reminderTitle: 'تذكير يومي على هاتفك',
    reminderIntro: 'يضيف تذكيرًا متكررًا في تقويم هاتفك، فينبّهك الهاتف كل يوم حتى والتطبيق مغلق.',
    reminderTime: 'وقت التذكير',
    reminderAdd: 'إضافة التذكير إلى التقويم',
    reminderDone: 'تم تجهيز التذكير، افتحه لإضافته للتقويم',
    installTitle: 'تثبيت التطبيق',
    installIntro: 'ثبّته على شاشتك الرئيسية ليفتح كتطبيق مستقل ويعمل حتى بلا إنترنت.',
    installNow: 'تثبيت صِلة',
    installIos: 'على آيفون: اضغط زر المشاركة في سفاري ثم «إضافة إلى الشاشة الرئيسية».',
    installDone: 'التطبيق مثبّت بالفعل على هذا الجهاز',
    installOther: 'من قائمة المتصفح (⋮) اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».',
    lastBackup: (d) => `آخر نسخة احتياطية: ${d}`,
    neverBackedUp: 'لم تحفظ نسخة احتياطية بعد',
    backupTitle: 'نسخة احتياطية',
    backupIntro: 'احتفظ بملف يحوي كل بياناتك، أو استعدها في جهاز آخر بهذا التطبيق.',
    backupDownload: 'تنزيل نسخة احتياطية',
    backupRestore: 'استعادة من نسخة احتياطية',
    backupDownloaded: 'تم تنزيل النسخة الاحتياطية',
    backupRestoreConfirmTitle: 'استعادة نسخة احتياطية',
    backupRestoreConfirmBody: 'سيستبدل هذا كل بيانات هذا الجهاز الحالية بمحتوى الملف الذي اخترته. هذا الإجراء لا يمكن التراجع عنه.',
    backupRestoreConfirmCta: 'استبدال البيانات',
    backupRestored: 'تمت الاستعادة بنجاح',
    backupInvalid: 'هذا الملف ليس نسخة احتياطية صالحة من صِلة',
  },
};

// درجات القرابة: وزن الأولوية، والمدة الافتراضية المقترحة بين كل تواصل (بالأيام)
export const DEGREES = [
  { id: 'closest', name: T.degrees.closest, weight: 4, defaultPeriodicityDays: 7, color: '#B5502C' },
  { id: 'family', name: T.degrees.family, weight: 3, defaultPeriodicityDays: 20, color: '#5B6E52' },
  { id: 'friends', name: T.degrees.friends, weight: 2, defaultPeriodicityDays: 21, color: '#B8862E' },
  { id: 'acquaintances', name: T.degrees.acquaintances, weight: 1, defaultPeriodicityDays: 45, color: '#6B5F58' },
];

export function getDegree(id) {
  return DEGREES.find((d) => d.id === id) || DEGREES[DEGREES.length - 1];
}

// قوالب الرسائل: بحسب مدة الغياب (قصيرة/متوسطة/طويلة) وقُرب درجة القرابة (قريب/بعيد)
export const MESSAGE_TEMPLATES = {
  close: {
    short: [
      'وحشتني يا {name}، بس خطرت على بالي حبيت أطمن عليك 🌿',
      'يا {name} طولت عني، شو أخبارك؟',
      '{name}.. خطرت على بالي هالأيام، كيفك وكيف الأحوال؟',
    ],
    medium: [
      'يا {name} والله اشتقتلك، طولت الغيبة بس ما نسيتك',
      'كل ما أفتح الصور أشوفك، حبيت أطمن عليك يا {name}',
      'يا {name}، الشغل شاغلني بس ما خلاني أنساك، شو أخبارك؟',
    ],
    long: [
      'يا {name} أعتذر منك على طول الغياب، بس أنت دايم في بالي',
      '{name}.. أعرف إني قصّرت هالفترة، بس حبيت أرجع أطمن عليك من قلبي',
      'يا {name} كل يوم أقول لازم أتواصل معك، واليوم قررت ما أأجل أكثر',
    ],
  },
  far: {
    short: [
      'مرحباً {name}، حبيت أطمئن عليك وعلى أحوالك',
      'أهلاً {name}، كيف الأمور معك هالأيام؟',
      'مرحباً {name}، خطرت على بالي، أتمنى تكون بخير',
    ],
    medium: [
      'مرحباً {name}، اعتذر على انقطاعي، حبيت أطمئن عليك',
      'أهلاً {name}، مرّ وقت من آخر تواصل، كيف أحوالك؟',
      'مرحباً {name}، تذكرتك اليوم وحبيت أسأل عنك',
    ],
    long: [
      'مرحباً {name}، أعتذر على طول الانقطاع، أتمنى أن تكون بخير وبصحة جيدة',
      'أهلاً {name}، أعرف أن الوقت طال، بس حبيت أجدد التواصل وأطمئن عليك',
      'مرحباً {name}، بعد غياب طويل حبيت أعتذر وأسأل عن أحوالك',
    ],
  },
};

export function pickTemplateBucket(daysSinceLastContact) {
  if (daysSinceLastContact == null || daysSinceLastContact > 90) return 'long';
  if (daysSinceLastContact > 30) return 'medium';
  return 'short';
}

export function pickTemplateCloseness(degreeId) {
  return degreeId === 'closest' || degreeId === 'family' ? 'close' : 'far';
}
