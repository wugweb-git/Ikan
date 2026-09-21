/**
 * The equip builder's shell, on a new (unsaved) programme — DEV ONLY.
 *
 * `EquipProgramWizard` is behind the admin login, so the two-screen shell that
 * replaced the stepper cannot otherwise be looked at. With no `programId` it
 * takes the "new programme" path and fetches nothing, so it renders offline.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { NotificationProvider } from '../src/shared/contexts/NotificationContext';
import { EquipProgramWizard } from '../src/admin/screens/EquipProgramWizard';
import '../src/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NotificationProvider>
      <EquipProgramWizard onBack={() => {}} onSave={() => {}} />
    </NotificationProvider>
  </StrictMode>,
);
