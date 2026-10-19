// Visible error reporting. If something throws, say so on screen (with details to copy) instead of
// leaving buttons that silently do nothing. Installed before anything else runs.

const IGNORE = [/ResizeObserver loop/i, /^Script error\.?$/i, /Non-Error promise rejection/i];
let bar = null;
let shown = 0;

function ensureBar() {
  if (bar) return bar;
  bar = document.createElement('div');
  bar.id = 'errbar';
  bar.setAttribute('role', 'alert');
  bar.hidden = true;
  bar.innerHTML =
    '<span class="errmsg"></span>' +
    '<span class="errbtns">' +
    '<button type="button" class="gb sm" data-err="copy">COPY DETAILS</button>' +
    '<button type="button" class="gb sm" data-err="reload">RELOAD</button>' +
    '<button type="button" class="gb sm" data-err="reset" hidden>RESET SAVED DATA</button>' +
    '<button type="button" class="gb sm" data-err="close" aria-label="Dismiss">X</button>' +
    '</span>';
  bar.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-err]');
    if (!b) return;
    const k = b.dataset.err;
    if (k === 'close') bar.hidden = true;
    if (k === 'reload') location.reload();
    if (k === 'reset' && window.confirm('Delete the saved data on this device (missions, settings, tiles, garden) and reload?')) {
      ['focusquest', 'fq_cover', 'fq_custom', 'fq_garden', 'fq_garden_meta', 'fq_pix_draft', 'fq_pix_pal', 'fq_sid_seq'].forEach((x) => localStorage.removeItem(x));
      location.reload();
    }
    if (k === 'copy') {
      const text = bar.dataset.details || bar.querySelector('.errmsg').textContent;
      try { await navigator.clipboard.writeText(text); b.textContent = 'COPIED'; } catch { b.textContent = 'SELECT + COPY'; window.prompt('Copy these details:', text); }
    }
  });
  document.body.appendChild(bar);
  return bar;
}

export function showError(message, details = '', { fatal = false } = {}) {
  if (IGNORE.some((r) => r.test(String(message)))) return;
  if (++shown > 5) return; // never flood the screen
  const b = ensureBar();
  b.querySelector('.errmsg').textContent = fatal ? `The app could not finish starting: ${message}` : `Something went wrong: ${message}`;
  b.dataset.details = `${message}\n${details}\n${navigator.userAgent}\n${location.href}`.trim();
  b.querySelector('[data-err=reset]').hidden = !fatal;
  b.querySelector('[data-err=copy]').textContent = 'COPY DETAILS';
  b.hidden = false;
  // eslint-disable-next-line no-console
  console.error(message, details);
}

export function installErrorReporting() {
  window.addEventListener('error', (e) => showError(e.message || 'Unknown error', String((e.error && e.error.stack) || `${e.filename}:${e.lineno}`)));
  window.addEventListener('unhandledrejection', (e) => {
    const r = e.reason;
    showError((r && r.message) || String(r), String((r && r.stack) || ''));
  });
}
