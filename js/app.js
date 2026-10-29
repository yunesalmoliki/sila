import { mountShell } from './ui.js';
import { route, notFound, startRouter, navigate } from './router.js';
import { setMode } from './db.js';
import { isConfigured, watchAuth } from './data/cloudAdapter.js';
import { renderHome } from './screens/home.js';
import { renderPeople } from './screens/people.js';
import { renderPersonForm } from './screens/personForm.js';
import { renderPersonDetail } from './screens/personDetail.js';
import { renderMessage } from './screens/message.js';
import { renderAccount } from './screens/account.js';

async function boot() {
  mountShell(document.getElementById('app-root'));

  // إن كانت المزامنة مُعدَّة فعلًا، ننتظر أول تحقّق من حالة الدخول (سريع جدًا محليًا)
  // قبل رسم أي شاشة، حتى لا تظهر بيانات محلية للحظة ثم تُستبدل ببيانات الحساب.
  // إن لم تكن مُعدَّة، هذا كله يُتجاوز فورًا بلا أي تأخير أو اتصال شبكي.
  if (isConfigured()) {
    await new Promise((resolve) => {
      let settled = false;
      watchAuth((user) => {
        setMode(user ? 'cloud' : 'local');
        if (!settled) { settled = true; resolve(); }
      });
    });
  }

  route('/', () => renderHome());
  route('/people', () => renderPeople());
  route('/account', () => renderAccount());
  route('/person/new', () => renderPersonForm({}));
  route('/person/:id/edit', (p) => renderPersonForm({ id: p.id }));
  route('/person/:id/message', (p) => renderMessage(p));
  route('/person/:id', (p) => renderPersonDetail(p));

  notFound(() => navigate('/'));

  startRouter();
}

boot();
