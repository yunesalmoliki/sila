// إذا أنشأت مشروع Firebase الخاص بك، الصق إعداداته هنا بدل القيم الفارغة
// (من: إعدادات المشروع ← عام ← Your apps ← تطبيق ويب).
// طالما القيم فارغة، يعمل التطبيق محليًا بالكامل تمامًا كاليوم، بلا أي اتصال خارجي.

export const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

export function isFirebaseConfigured() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}
