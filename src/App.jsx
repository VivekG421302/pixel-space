import { useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Buddy from './components/Buddy';
import HiddenInputs from './components/HiddenInputs';
import MenuModal from './components/MenuModal';
import SettingsModal from './components/SettingsModal';
import AboutModal from './components/AboutModal';
import BannerModal from './components/BannerModal';
import GardenModal from './components/GardenModal';
import TileManagerModal from './components/TileManagerModal';
import SheetImportModal from './components/SheetImportModal';
import PixelCreatorModal from './components/PixelCreatorModal';
import { initApp } from './engine/app';

export default function App() {
  // Attach the interactive engine once the markup is in the DOM.
  useEffect(() => {
    initApp();
  }, []);

  return (
    <>
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
      <HiddenInputs />
    </>
  );
}
