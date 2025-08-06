import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';
import { configureGA4, initializeScrollDepthTracking, initializeSectionDwellTracking } from './utils/analytics';

// Configure GA4 with debug settings
configureGA4();

// Initialize advanced tracking
document.addEventListener('DOMContentLoaded', () => {
  initializeScrollDepthTracking();
  initializeSectionDwellTracking();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);
