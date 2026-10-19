import { useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Buddy from './components/Buddy';
import HiddenInputs from './components/HiddenInputs';
import ConfirmModal from './components/ConfirmModal';
import MenuModal from './components/MenuModal';
import SettingsModal from './components/SettingsModal';
import AboutModal from './components/AboutModal';
import BannerModal from './components/BannerModal';
import GardenModal from './components/GardenModal';
import TileManagerModal from './components/TileManagerModal';
import SheetImportModal from './components/SheetImportModal';
import PixelCreatorModal from './components/PixelCreatorModal';
import { initApp } from './engine/app';
import { showError } from './errors.js';
import { AuthProvider } from './auth/AuthContext';
import AuthModal from './auth/AuthModal';

export default function App() {
  // Attach the interactive engine once the markup is in the DOM.
  useEffect(() => {
    try {
      initApp();
    } catch (e) {
      // keep the page on screen and say what happened instead of leaving dead buttons
      showError(e.message, e.stack, { fatal: true });
    }
  }, []);

  return (
    <AuthProvider>
      <a className="skip" href="#play">Skip to timer controls</a>
      <Dashboard />
      <Buddy />
      <MenuModal />
      <SettingsModal />
      <AboutModal />
      <BannerModal />
      <GardenModal />
      <TileManagerModal />
      <SheetImportModal />
      <PixelCreatorModal />
      <ConfirmModal />
      <HiddenInputs />
      <AuthModal />
    </AuthProvider>
  );
}
