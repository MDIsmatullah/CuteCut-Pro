import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global Fetch Interceptor to automatically append the personal Gemini API Key
const originalFetch = window.fetch;

function getActiveUserApiKey(): string {
  const raw = localStorage.getItem('user_gemini_api_key') || 
              localStorage.getItem('cutecut_custom_gemini_api_key') || 
              localStorage.getItem('gemini_api_key') || '';
  let cleaned = raw.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

function attachKeyHeaders(init?: any): any {
  const userApiKey = getActiveUserApiKey();
  if (!userApiKey || userApiKey.length < 10) return init;

  const newInit = { ...(init || {}) };
  const headers = new Headers(newInit.headers || {});
  if (!headers.has('x-user-gemini-key')) {
    headers.set('x-user-gemini-key', userApiKey);
  }
  if (!headers.has('x-gemini-api-key')) {
    headers.set('x-gemini-api-key', userApiKey);
  }
  newInit.headers = headers;
  return newInit;
}

try {
  Object.defineProperty(window, 'fetch', {
    value: async function (input: any, init?: any) {
      const url = typeof input === 'string' ? input : (input instanceof URL ? input.toString() : input?.url || '');
      
      if (url && (url.includes('/api/ai/') || url.includes('/api/quran/') || url.includes('/api/video/') || url.includes('/api/health'))) {
        return originalFetch.call(this, input, attachKeyHeaders(init));
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
      const url = typeof input === 'string' ? input : (input instanceof URL ? input.toString() : input?.url || '');
      if (url && (url.includes('/api/ai/') || url.includes('/api/quran/') || url.includes('/api/video/') || url.includes('/api/health'))) {
        return originalFetch.call(this, input, attachKeyHeaders(init));
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
