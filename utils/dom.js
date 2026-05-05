export function escapeHTML(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
export function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

export function triggerRipple(el) {
  el.querySelectorAll('.ripple').forEach(r => r.remove());
  const r = document.createElement('span');
  r.className = 'ripple';
  el.appendChild(r);
  setTimeout(() => r.remove(), 500);
}
