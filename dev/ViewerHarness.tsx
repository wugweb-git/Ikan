/**
 * The block-type reference page, outside the admin login — DEV ONLY.
 *
 * The page states the vocabulary's counts, so after §26 replaced it the counts
 * are the thing to look at: nine interactions, twenty-nine activities, seven
 * labels. It reads live catalog rows, so the tiles also show whether the store
 * has caught up with the seed.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AdminBlockTypeViewer } from '../src/admin/block-types/BlockTypeViewer';
import '../src/product/site/ui/styles/index.css';
import '../src/admin/ui/styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode><AdminBlockTypeViewer onBack={() => {}} /></StrictMode>,
);
