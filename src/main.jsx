import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource/barlow-condensed/latin-500.css';
import '@fontsource/barlow-condensed/latin-600.css';
import '@fontsource/barlow-condensed/latin-700.css';
import '@fontsource/ibm-plex-sans/latin-400.css';
import '@fontsource/ibm-plex-sans/latin-500.css';
import '@fontsource/ibm-plex-sans/latin-600.css';
import App from './App.jsx';
import { InspectorStoreProvider } from './context/InspectorStore.jsx';
import { NetworkProvider } from './context/NetworkContext.jsx';
import { PwaProvider } from './context/PwaContext.jsx';
import { SessionProvider } from './context/SessionContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <NetworkProvider>
          <PwaProvider>
            <SessionProvider>
              <InspectorStoreProvider>
                <App />
              </InspectorStoreProvider>
            </SessionProvider>
          </PwaProvider>
        </NetworkProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
