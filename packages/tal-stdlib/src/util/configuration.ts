import { windowExists } from './window';

export let backendUrl: string | null = null;

export function getBackendurl(): string {
  if (backendUrl == null) {
    setBackendUrl();
  }
  return backendUrl ?? '';
}

const globalThisExists = (() => {
  try {
    if (globalThis) {
      return true;
    }
  } catch {}
  return false;
})();

function setBackendUrl() {
  try {
    if (windowExists && 'electronAPI' in window) {
      backendUrl = (window.electronAPI as any).config().backendUrl;
    } else if (globalThisExists && (globalThis as any).backendUrl) {
      backendUrl = (globalThis as any).backendUrl;
    }
  } catch (err) {
    console.log('failed to initialize config event');
  }
}

setBackendUrl();
