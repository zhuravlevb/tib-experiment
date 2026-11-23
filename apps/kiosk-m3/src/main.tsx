import { createRoot } from 'react-dom/client';
import Framework7 from 'framework7/lite-bundle';
import Framework7React from 'framework7-react';
import 'framework7/css/bundle';
import 'material-icons/iconfont/material-icons.css';
import '@tib/react/m3-expressive.css';
import '@tib/kiosk-app/kiosk.css';
import App from './App';

Framework7.use(Framework7React);
createRoot(document.getElementById('app')!).render(<App />);
