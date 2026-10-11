import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as api from './api';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

// Non-sensitive hint that this browser had a session, so guests never trigger a pointless refresh call.
const HINT = 'fq_session';
const emit = (status, user) => window.dispatchEvent(new CustomEvent('fq:auth-changed', { detail: { status, user } }));

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('checking'); // checking | guest | authed
  const [user, setUser] = useState(null);
  const [modal, setModal] = useState({ open: false, view: 'login', notice: null, token: null });
  const timer = useRef(null);
  const statusRef = useRef(status);
  statusRef.current = status;

  const goGuest = useCallback(() => {
    clearTimeout(timer.current);
    api.clearToken();
    try {
      localStorage.removeItem(HINT);
    } catch {
      /* storage unavailable */
    }
    setUser(null);
    setStatus('guest');
    emit('guest', null);
  }, []);

  const scheduleRefresh = useCallback(() => {
    clearTimeout(timer.current);
    const ttl = api.tokenTtlMs();
    if (ttl <= 0) return;
    timer.current = setTimeout(() => {
      api.refreshSession().then(scheduleRefresh, goGuest);
    }, Math.max(5000, ttl * 0.8));
  }, [goGuest]);

  const adopt = useCallback(
    async (d) => {
      const u = d.user || (await api.me());
      try {
        localStorage.setItem(HINT, '1');
      } catch {
        /* storage unavailable */
      }
      setUser(u);
      setStatus('authed');
      emit('authed', u);
      scheduleRefresh();
      return u;
    },
    [scheduleRefresh],
  );

  const openAuth = useCallback((view, extra = {}) => {
    setModal({ open: true, view: view || (statusRef.current === 'authed' ? 'account' : 'login'), notice: null, token: null, ...extra });
  }, []);
  const closeAuth = useCallback(() => setModal((m) => ({ ...m, open: false })), []);
  const setView = useCallback((view, extra = {}) => setModal((m) => ({ ...m, view, notice: null, ...extra })), []);

  // Boot: handle ?reset=, ?auth= (OAuth return) and silently restore a previous session.
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const reset = q.get('reset');
    const oauth = q.get('auth');
    const oauthMsg = q.get('message');
    if (reset || oauth) {
      ['reset', 'auth', 'message'].forEach((k) => q.delete(k));
      const qs = q.toString();
      history.replaceState(null, '', location.pathname + (qs ? `?${qs}` : '') + location.hash);
    }
    let live = true;
    (async () => {
      let hint = false;
      try {
        hint = localStorage.getItem(HINT) === '1';
      } catch {
        /* storage unavailable */
      }
      if (hint || oauth === 'success') {
        try {
          const d = await api.refreshSession();
          if (!live) return;
          await adopt(d);
          if (oauth === 'success') openAuth('account', { notice: { kind: 'ok', text: 'You are signed in.' } });
        } catch {
          if (!live) return;
          goGuest();
          if (oauth === 'success') openAuth('login', { notice: { kind: 'bad', text: 'Sign-in could not be completed. Please try again.' } });
        }
      } else {
        setStatus('guest');
      }
      if (!live) return;
      if (oauth === 'error') openAuth('login', { notice: { kind: 'bad', text: oauthMsg || 'Sign-in with that provider failed. Please try again.' } });
      if (reset) openAuth('reset', { token: reset });
    })();
    return () => {
      live = false;
    };
  }, [adopt, goGuest, openAuth]);

  // Keep tabs in sync: signing out in one tab signs out the others.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === HINT && e.newValue === null && statusRef.current === 'authed') goGuest();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [goGuest]);

  const value = useMemo(
    () => ({
      status,
      user,
      modal,
      openAuth,
      closeAuth,
      setView,
      login: async (email, password, remember) => adopt(await api.login(email, password, remember)),
      signup: async (name, email, password) => adopt(await api.signup(name, email, password)),
      logout: async () => {
        try {
          await api.logout();
        } catch {
          /* still sign out locally */
        }
        goGuest();
      },
      forgotPassword: api.forgotPassword,
      resetPassword: api.resetPassword,
      authFetch: api.authFetch,
    }),
    [status, user, modal, openAuth, closeAuth, setView, adopt, goGuest],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
