// عناصر واجهة مشتركة: الهيكل العام، التوست، الأوراق المنزلقة، وبطاقة الشخص.

import { Icon } from './icons.js';
import { getDegree } from './content.js';
import { overdueDays } from './db.js';
import { humanDuration, sinceLabel } from './utils.js';

export const els = {
  root: null,
  topbar: null,
  screen: null,
  tabbar: null,
};

export function mountShell(root) {
  root.innerHTML = `
    <div class="phone">
      <div class="topbar" id="topbar"></div>
      <div class="screen" id="screen"></div>
      <div class="tabbar" id="tabbar"></div>
    </div>
  `;
  els.root = root;
  els.topbar = root.querySelector('#topbar');
  els.screen = root.querySelector('#screen');
  els.tabbar = root.querySelector('#tabbar');
}

export function setTopbar(html) {
  els.topbar.innerHTML = html;
}

export function setScreen(html) {
  els.screen.innerHTML = `<div class="fade-in">${html}</div>`;
  els.screen.scrollTop = 0;
}

export function showTabbar(activeKey, onNavigate) {
  els.tabbar.style.display = 'flex';
  els.tabbar.innerHTML = `
    <button class="tab ${activeKey === 'home' ? 'active' : ''}" data-tab="home">
      ${activeKey === 'home' ? Icon.homeFilled : Icon.home}<span>الرئيسية</span>
    </button>
    <button class="tab ${activeKey === 'people' ? 'active' : ''}" data-tab="people">
      ${activeKey === 'people' ? Icon.peopleFilled : Icon.people}<span>الأشخاص</span>
    </button>
  `;
  els.tabbar.querySelectorAll('.tab').forEach((btn) => {
    btn.onclick = () => onNavigate(btn.dataset.tab);
  });
  els.screen.classList.remove('no-tabbar');
}

export function hideTabbar() {
  els.tabbar.style.display = 'none';
  els.screen.classList.add('no-tabbar');
}

export function topbarWithBack(title, onBack, actionsHtml = '') {
  return `
    <button class="icon-btn" id="btn-back" aria-label="رجوع">${Icon.back}</button>
    <h1>${title}</h1>
    ${actionsHtml}
  `;
}

export function wireBack(onBack) {
  const btn = document.getElementById('btn-back');
  if (btn) btn.onclick = onBack;
}

const AVATAR_PALETTE = ['#B5502C', '#5B6E52', '#B8862E', '#8B5A6B', '#4A6B6B', '#7A6A45', '#6B5344', '#5F6B4A'];

function colorForName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

export function avatarHtml(name, size = 48) {
  const initial = (name || '؟').trim().charAt(0);
  const style = `width:${size}px;height:${size}px;font-size:${Math.round(size * 0.36)}px;background:${colorForName(name || '')}`;
  return `<div class="avatar" style="${style}">${initial}</div>`;
}

// أيقونة ضمن حاوية ملوّنة — الوحدة الموحّدة لكل أيقونات المحتوى (لا أدوات التحكم البحتة)
export function iconChip(icon, tone = 'clay', size = 'md') {
  return `<span class="icon-chip sz-${size} tone-${tone}">${icon}</span>`;
}

export function degreeBadgeHtml(degreeId) {
  const d = getDegree(degreeId);
  return `<span class="badge" style="background:${d.color}22;color:${d.color}">${d.name}</span>`;
}

export function personRowHtml(person) {
  const overdue = overdueDays(person);
  const d = getDegree(person.degreeId);
  const lastLabel = person.lastContactDate
    ? sinceLabel(daysSinceToday(person.lastContactDate))
    : 'لم يسبق التواصل';
  return `
    <div class="person-row" data-id="${person.id}" ${person.archived ? 'style="opacity:.5"' : ''}>
      ${avatarHtml(person.name)}
      <div class="info">
        <div class="name">${escapeHtml(person.name)}</div>
        <div class="meta">
          <span style="color:${d.color}">${d.name}</span>
          <span class="dot"></span>
          <span>${person.archived ? 'مؤرشَف' : lastLabel}</span>
        </div>
      </div>
      ${!person.archived && overdue > 0 ? `<span class="overdue-pill">متأخر ${humanDuration(overdue)}</span>` : (!person.archived && overdue === 0 ? '<span class="overdue-pill">اليوم</span>' : '')}
    </div>
  `;
}

function daysSinceToday(iso) {
  const a = new Date(iso + 'T00:00:00');
  const b = new Date();
  b.setHours(0, 0, 0, 0);
  return Math.round((b - a) / 86400000);
}

export function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

let toastTimer = null;
export function toast(message) {
  document.querySelectorAll('.toast').forEach((t) => t.remove());
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `${Icon.check}<span>${escapeHtml(message)}</span>`;
  document.body.appendChild(el);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.remove(), 2400);
}

export function openSheet(innerHtml, { onMount } = {}) {
  const backdrop = document.createElement('div');
  backdrop.className = 'sheet-backdrop';
  backdrop.innerHTML = `<div class="sheet">${innerHtml}</div>`;
  document.body.appendChild(backdrop);
  const close = () => backdrop.remove();
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  if (onMount) onMount(backdrop.querySelector('.sheet'), close);
  return close;
}
