// موجّه بسيط قائم على الـ hash، بلا أي مكتبة خارجية.

const routes = [];
let notFoundHandler = null;

export function route(pattern, handler) {
  // pattern مثل: '/person/:id/edit'
  const paramNames = [];
  const regexStr = pattern
    .split('/')
    .map((seg) => {
      if (seg.startsWith(':')) {
        paramNames.push(seg.slice(1));
        return '([^/]+)';
      }
      return seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('/');
  routes.push({ regex: new RegExp(`^${regexStr}$`), paramNames, handler });
}

export function notFound(handler) {
  notFoundHandler = handler;
}

function currentPath() {
  const hash = location.hash.slice(1);
  return hash === '' ? '/' : hash;
}

function resolve() {
  const path = currentPath();
  for (const r of routes) {
    const m = path.match(r.regex);
    if (m) {
      const params = {};
      r.paramNames.forEach((name, i) => { params[name] = decodeURIComponent(m[i + 1]); });
      r.handler(params);
      return;
    }
  }
  if (notFoundHandler) notFoundHandler();
}

export function navigate(path) {
  if (currentPath() === path) {
    resolve();
  } else {
    location.hash = path;
  }
}

export function currentRoutePath() { return currentPath(); }

export function refresh() { resolve(); }

export function back() {
  history.back();
}

export function startRouter() {
  window.addEventListener('hashchange', resolve);
  resolve();
}
