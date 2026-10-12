import { useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { OAUTH_PROVIDERS, oauthUrl } from './api';
import { normEmail, passwordChecks, passwordScore, validate } from './validation';

const GithubIcon = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="currentColor">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);
const GoogleIcon = () => (
  <span className="gglyph" aria-hidden="true">
    G
  </span>
);
const PROVIDERS = { google: { label: 'GOOGLE', icon: <GoogleIcon /> }, github: { label: 'GITHUB', icon: <GithubIcon /> } };

function Field({ id, label, error, inputRef, children, onChange, ...rest }) {
  return (
    <div className="af">
      <label htmlFor={id}>{label}</label>
      <div className="afrow">
        <input id={id} ref={inputRef} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} aria-describedby={error ? `${id}-e` : undefined} {...rest} />
        {children}
      </div>
      {error && (
        <p className="aerr" id={`${id}-e`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function PasswordField({ id, label, value, onChange, error, autoComplete, inputRef, meter }) {
  const [show, setShow] = useState(false);
  const score = passwordScore(value);
  return (
    <>
      <Field id={id} label={label} type={show ? 'text' : 'password'} value={value} onChange={onChange} error={error} autoComplete={autoComplete} inputRef={inputRef} maxLength={72}>
        <button type="button" className="gb sm" onClick={() => setShow((s) => !s)} aria-pressed={show} aria-label={show ? 'Hide password' : 'Show password'}>
          {show ? 'HIDE' : 'SHOW'}
        </button>
      </Field>
      {meter && (
        <div className="pwhelp" aria-live="polite">
          <div className="meter" aria-hidden="true">
            {[1, 2, 3, 4].map((n) => (
              <i key={n} className={score >= n ? 'on' : ''} />
            ))}
          </div>
          <ul>
            {passwordChecks(value).map((c) => (
              <li key={c.label} className={c.ok ? 'ok' : ''}>
                {c.ok ? '✓' : '·'} {c.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function Notice({ notice }) {
  if (!notice) return null;
  return (
    <p className={`notice ${notice.kind === 'bad' ? 'bad' : ''}`} role={notice.kind === 'bad' ? 'alert' : 'status'}>
      {notice.text}
    </p>
  );
}

function OAuthButtons({ verb }) {
  if (!OAUTH_PROVIDERS.length) return null;
  return (
    <>
      <div className="oauthlist">
        {OAUTH_PROVIDERS.map((p) => (
          <button key={p} type="button" className="gb oauth" onClick={() => (window.location.href = oauthUrl(p))}>
            {PROVIDERS[p]?.icon}
            <span>
              {verb} WITH {PROVIDERS[p]?.label || p.toUpperCase()}
            </span>
          </button>
        ))}
      </div>
      <div className="or" aria-hidden="true">
        OR
      </div>
    </>
  );
}

function useForm(initial, view, submit) {
  const [v, setV] = useState(initial);
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState(null);
  const set = (k) => (val) => {
    setV((o) => ({ ...o, [k]: val }));
    setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e));
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    if (pending) return;
    const errs = validate(view, v);
    setErrors(errs);
    setNotice(null);
    if (Object.keys(errs).length) return;
    setPending(true);
    try {
      await submit(v);
    } catch (err) {
      if (err.fields && Object.keys(err.fields).length) setErrors(err.fields);
      setNotice({ kind: 'bad', text: err.message });
    } finally {
      setPending(false);
    }
  };
  return { v, set, errors, pending, notice, setNotice, onSubmit };
}

function LoginView({ auth, first }) {
  const f = useForm({ email: '', password: '', remember: true }, 'login', async (v) => {
    await auth.login(normEmail(v.email), v.password, v.remember);
  });
  return (
    <form onSubmit={f.onSubmit} noValidate>
      <Notice notice={auth.modal.notice} />
      <Notice notice={f.notice} />
      <p className="aguest">You are playing as a guest. Log in to keep your progress and use it on other devices.</p>
      <OAuthButtons verb="CONTINUE" />
      <Field id="au-email" label="Email" type="email" value={f.v.email} onChange={f.set('email')} error={f.errors.email} autoComplete="email" inputRef={first} inputMode="email" />
      <PasswordField id="au-pass" label="Password" value={f.v.password} onChange={f.set('password')} error={f.errors.password} autoComplete="current-password" />
      <label className="achk">
        <input type="checkbox" checked={f.v.remember} onChange={(e) => f.set('remember')(e.target.checked)} />
        <span>Keep me signed in on this device</span>
      </label>
      <button className="gb on awide" type="submit" disabled={f.pending}>
        {f.pending ? 'WORKING...' : 'LOG IN'}
      </button>
      <div className="alinks">
        <button type="button" className="alink" onClick={() => auth.setView('forgot')}>
          Forgot password?
        </button>
        <button type="button" className="alink" onClick={() => auth.setView('signup')}>
          Create an account
        </button>
      </div>
    </form>
  );
}

function SignupView({ auth, first }) {
  const f = useForm({ name: '', email: '', password: '', confirm: '' }, 'signup', async (v) => {
    await auth.signup(v.name.trim(), normEmail(v.email), v.password);
    auth.setView('account', { notice: { kind: 'ok', text: 'Welcome! Your account is ready.' } });
  });
  return (
    <form onSubmit={f.onSubmit} noValidate>
      <Notice notice={f.notice} />
      <OAuthButtons verb="SIGN UP" />
      <Field id="au-name" label="Display name" value={f.v.name} onChange={f.set('name')} error={f.errors.name} autoComplete="nickname" inputRef={first} maxLength={40} />
      <Field id="au-email" label="Email" type="email" value={f.v.email} onChange={f.set('email')} error={f.errors.email} autoComplete="email" inputMode="email" />
      <PasswordField id="au-pass" label="Password" value={f.v.password} onChange={f.set('password')} error={f.errors.password} autoComplete="new-password" meter />
      <PasswordField id="au-conf" label="Confirm password" value={f.v.confirm} onChange={f.set('confirm')} error={f.errors.confirm} autoComplete="new-password" />
      <button className="gb on awide" type="submit" disabled={f.pending}>
        {f.pending ? 'WORKING...' : 'CREATE ACCOUNT'}
      </button>
      <div className="alinks">
        <button type="button" className="alink" onClick={() => auth.setView('login')}>
          I already have an account
        </button>
      </div>
    </form>
  );
}

function ForgotView({ auth, first }) {
  const [sent, setSent] = useState(false);
  const f = useForm({ email: '' }, 'forgot', async (v) => {
    await auth.forgotPassword(normEmail(v.email));
    setSent(true);
  });
  if (sent)
    return (
      <div>
        <p className="notice" role="status">
          If an account exists for that email, we have sent a link to reset the password. It expires soon, so check your inbox and spam folder.
        </p>
        <button className="gb awide" type="button" onClick={() => auth.setView('login')}>
          BACK TO LOG IN
        </button>
      </div>
    );
  return (
    <form onSubmit={f.onSubmit} noValidate>
      <Notice notice={f.notice} />
      <p className="aguest">Enter the email you signed up with and we will send you a reset link.</p>
      <Field id="au-email" label="Email" type="email" value={f.v.email} onChange={f.set('email')} error={f.errors.email} autoComplete="email" inputRef={first} inputMode="email" />
      <button className="gb on awide" type="submit" disabled={f.pending}>
        {f.pending ? 'SENDING...' : 'SEND RESET LINK'}
      </button>
      <div className="alinks">
        <button type="button" className="alink" onClick={() => auth.setView('login')}>
          Back to log in
        </button>
      </div>
    </form>
  );
}

function ResetView({ auth, first }) {
  const token = auth.modal.token;
  const [bad, setBad] = useState(false);
  const f = useForm({ password: '', confirm: '' }, 'reset', async (v) => {
    try {
      await auth.resetPassword(token, v.password);
    } catch (err) {
      if (err.status === 400 || err.status === 404 || err.status === 410) setBad(true);
      throw err;
    }
    auth.setView('login', { notice: { kind: 'ok', text: 'Password updated. Please log in with your new password.' } });
  });
  if (!token || bad)
    return (
      <div>
        <p className="notice bad" role="alert">
          This reset link is invalid or has expired.
        </p>
        <button className="gb on awide" type="button" onClick={() => auth.setView('forgot')}>
          REQUEST A NEW LINK
        </button>
      </div>
    );
  return (
    <form onSubmit={f.onSubmit} noValidate>
      <Notice notice={f.notice} />
      <p className="aguest">Choose a new password for your account.</p>
      <PasswordField id="au-pass" label="New password" value={f.v.password} onChange={f.set('password')} error={f.errors.password} autoComplete="new-password" inputRef={first} meter />
      <PasswordField id="au-conf" label="Confirm new password" value={f.v.confirm} onChange={f.set('confirm')} error={f.errors.confirm} autoComplete="new-password" />
      <button className="gb on awide" type="submit" disabled={f.pending}>
        {f.pending ? 'SAVING...' : 'SET NEW PASSWORD'}
      </button>
    </form>
  );
}

function AccountView({ auth }) {
  const { user } = auth;
  const [busy, setBusy] = useState(false);
  if (!user) return null;
  const initial = (user.name || user.email || '?').trim().charAt(0).toUpperCase();
  return (
    <div>
      <Notice notice={auth.modal.notice} />
      <div className="acct">
        <span className="avatar" aria-hidden="true">
          {initial}
        </span>
        <div className="acctinfo">
          <b>{user.name}</b>
          <small>{user.email}</small>
          <small className="prov">{user.provider && String(user.provider).toLowerCase() !== 'local' ? `SIGNED IN WITH ${String(user.provider).toUpperCase()}` : 'EMAIL ACCOUNT'}</small>
        </div>
      </div>
      <p className="aguest">Progress sync across devices is coming next. For now your garden, tasks and settings stay on this device.</p>
      <button
        className="gb awide"
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          await auth.logout();
          setBusy(false);
          auth.closeAuth();
        }}
      >
        {busy ? 'SIGNING OUT...' : 'SIGN OUT'}
      </button>
    </div>
  );
}

const TITLES = { login: 'LOG IN', signup: 'SIGN UP', forgot: 'FORGOT PASSWORD', reset: 'NEW PASSWORD', account: 'ACCOUNT' };

export default function AuthModal() {
  const auth = useAuth();
  const { modal, status, closeAuth } = auth;
  const first = useRef(null);
  const dialog = useRef(null);
  const view = modal.view === 'account' && status !== 'authed' ? 'login' : modal.view === 'login' && status === 'authed' ? 'account' : modal.view;

  useEffect(() => {
    if (!modal.open) return undefined;
    const prev = document.activeElement;
    const t = setTimeout(() => (first.current || dialog.current?.querySelector('button,input'))?.focus(), 30);
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeAuth();
      } else if (e.key === 'Tab' && dialog.current) {
        const els = [...dialog.current.querySelectorAll('button:not([disabled]),input:not([disabled]),a[href]')];
        if (!els.length) return;
        const a = els[0];
        const z = els[els.length - 1];
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          z.focus();
        } else if (!e.shiftKey && document.activeElement === z) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey, true);
      prev?.focus?.();
    };
  }, [modal.open, view, closeAuth]);

  if (!modal.open) return null;
  const common = { auth: { ...auth, modal }, first };
  return (
    <div className="amodal open" onMouseDown={(e) => e.target === e.currentTarget && closeAuth()}>
      <div className="box sheet authbox" role="dialog" aria-modal="true" aria-labelledby="au-title" ref={dialog}>
        <div className="sh">
          <h2 className="text-[length:calc(12px*var(--ts))]" id="au-title">
            {TITLES[view]}
          </h2>
          <button className="gb !px-2 !py-1" type="button" onClick={closeAuth} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="sb" key={view}>
          <div style={{ height: 12 }} />
          {view === 'login' && <LoginView {...common} />}
          {view === 'signup' && <SignupView {...common} />}
          {view === 'forgot' && <ForgotView {...common} />}
          {view === 'reset' && <ResetView {...common} />}
          {view === 'account' && <AccountView {...common} />}
        </div>
      </div>
    </div>
  );
}
