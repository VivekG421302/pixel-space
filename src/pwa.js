// PWA glue: service worker registration, install prompt and update state.
// The imperative engine (src/engine/app.js) reads `pwa` and listens for the `fq:pwa` window event.
import { registerSW } from 'virtual:pwa-register';

const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export const pwa = {
  supported: 'serviceWorker' in navigator,
  offlineReady: false, // everything is cached; the app works without a connection
  needRefresh: false, // a new version is downloaded and waiting
  installEvent: null, // the browser's deferred install prompt, when it offers one
  installed: standalone(),
  ios,
  registration: null,
  update: () => {}, // reload into the waiting version
};

const emit = () => window.dispatchEvent(new CustomEvent('fq:pwa'));

export function initPwa() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    pwa.installEvent = e;
    emit();
  });
  window.addEventListener('appinstalled', () => {
    pwa.installEvent = null;
    pwa.installed = true;
    emit();
  });
  matchMedia('(display-mode: standalone)').addEventListener?.('change', () => {
    pwa.installed = standalone();
    emit();
  });
  window.addEventListener('online', emit);
  window.addEventListener('offline', emit);

  if (!pwa.supported) return;
  pwa.update = registerSW({
    immediate: true,
    onOfflineReady() {
      pwa.offlineReady = true;
      emit();
    },
    onNeedRefresh() {
      pwa.needRefresh = true;
      emit();
    },
    onRegisteredSW(_url, reg) {
      pwa.registration = reg || null;
      // Look for a new version when the app comes back to the foreground, and hourly while it stays open.
      if (reg) {
        document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && reg.update().catch(() => {}));
        setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
      }
    },
  });
}

export async function promptInstall() {
  const e = pwa.installEvent;
  if (!e) return 'unavailable';
  e.prompt();
  const { outcome } = await e.userChoice;
  pwa.installEvent = null;
  emit();
  return outcome;
}
