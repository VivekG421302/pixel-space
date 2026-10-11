import { useAuth } from './AuthContext';

// Last item of the game menu. Keeps a constant className so the engine's cursor highlight is never overwritten.
export default function AccountMenuItem() {
  const { status, user, openAuth } = useAuth();
  const authed = status === 'authed' && user;
  return (
    <button className="mi" id="bacct" role="menuitem" onClick={() => openAuth()}>
      <span className="mtxt">
        <span>{authed ? 'ACCOUNT' : 'LOGIN / SIGN UP'}</span>
        <small>{authed ? (user.name || user.email).slice(0, 22).toUpperCase() : status === 'checking' ? 'CHECKING...' : 'PLAYING AS GUEST'}</small>
      </span>
    </button>
  );
}
