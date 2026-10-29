import { mountShell } from './ui.js';
import { route, notFound, startRouter, navigate, refresh, currentRoutePath } from './router.js';
import { startAutoSync } from './sync.js';
import { renderHome } from './screens/home.js';
import { renderPeople } from './screens/people.js';
import { renderPersonForm } from './screens/personForm.js';
import { renderPersonDetail } from './screens/personDetail.js';
import { renderMessage } from './screens/message.js';
import { renderAccount } from './screens/account.js';
import { showWelcome } from './screens/welcome.js';

function boot() {
  mountShell(document.getElementById('app-root'));

  route('/', () => renderHome());
  route('/people', () => renderPeople());
  route('/account', () => renderAccount());
  route('/person/new', () => renderPersonForm({}));
  route('/person/:id/edit', (p) => renderPersonForm({ id: p.id }));
  route('/person/:id/message', (p) => renderMessage(p));
  route('/person/:id', (p) => renderPersonDetail(p));

  notFound(() => navigate('/'));

  startRouter();
  showWelcome();

  // بعد دمج بيانات من جهاز آخر: حدّث الشاشات القرائية فقط، ولا تقاطع من يكتب في نموذج
  window.addEventListener('sila:data-merged', () => {
    const path = currentRoutePath();
    if (path === '/' || path === '/people' || /^\/person\/[^/]+$/.test(path)) refresh();
  });
  startAutoSync();
}

boot();
