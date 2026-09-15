import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global Fetch Interceptor to automatically append the personal Gemini API Key
const originalFetch = window.fetch;
try {
  Object.defineProperty(window, 'fetch', {
    value: async function (input: any, init?: any) {
      const url = typeof input === 'string' ? input : (input instanceof URL ? input.toString() : input.url);
      
      if (url && (url.includes('/api/ai/') || url.includes('/api/quran/'))) {
        const userApiKey = localStorage.getItem('user_gemini_api_key');
        if (userApiKey && userApiKey.trim().length >= 10) {
          const newInit = { ...(init || {}) };
          const headers = new Headers(newInit.headers || {});
          headers.set('x-user-gemini-key', userApiKey.trim());
          newInit.headers = headers;
          return originalFetch.call(this, input, newInit);
        }
      }
      return originalFetch.call(this, input, init);
    },
    writable: true,
    configurable: true,
    enumerable: true
  });
} catch (e) {
  console.warn('[Fetch Interceptor] Failed to redefine window.fetch using Object.defineProperty, falling back to basic setter:', e);
  try {
    (window as any).fetch = async function (input: any, init?: any) {
      const url = typeof input === 'string' ? input : (input instanceof URL ? input.toString() : input.url);
      if (url && (url.includes('/api/ai/') || url.includes('/api/quran/'))) {
        const userApiKey = localStorage.getItem('user_gemini_api_key');
        if (userApiKey && userApiKey.trim().length >= 10) {
          const newInit = { ...(init || {}) };
          const headers = new Headers(newInit.headers || {});
          headers.set('x-user-gemini-key', userApiKey.trim());
          newInit.headers = headers;
          return originalFetch.call(this, input, newInit);
        }
      }
      return originalFetch.call(this, input, init);
    };
  } catch (err) {
    console.error('[Fetch Interceptor] All fetch interception attempts failed:', err);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
