export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const normEmail = (v) => v.trim().toLowerCase();

export function passwordChecks(p) {
  return [
    { ok: p.length >= 8, label: '8+ characters' },
    { ok: /[a-z]/.test(p) && /[A-Z]/.test(p), label: 'Upper and lower case' },
    { ok: /\d/.test(p), label: 'A number' },
  ];
}
export const passwordScore = (p) => passwordChecks(p).filter((c) => c.ok).length + (p.length >= 12 ? 1 : 0);
export const passwordOk = (p) => passwordChecks(p).every((c) => c.ok);

/** Returns { field: message } for the given view. Empty object means valid. */
export function validate(view, v) {
  const e = {};
  const name = (v.name || '').trim();
  if (view === 'signup') {
    if (name.length < 2) e.name = 'Enter at least 2 characters.';
    else if (name.length > 40) e.name = 'Keep it under 40 characters.';
  }
  if (view === 'login' || view === 'signup' || view === 'forgot') {
    if (!v.email.trim()) e.email = 'Enter your email.';
    else if (!EMAIL_RE.test(v.email.trim())) e.email = 'That email does not look right.';
  }
  if (view === 'login') {
    if (!v.password) e.password = 'Enter your password.';
  }
  if (view === 'signup' || view === 'reset') {
    if (!passwordOk(v.password)) e.password = 'Use 8+ characters with upper and lower case letters and a number.';
    else if (v.password.length > 72) e.password = 'Keep it under 72 characters.';
    if (v.confirm !== v.password) e.confirm = 'The passwords do not match.';
  }
  return e;
}
