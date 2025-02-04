export const windowExists = (() => {
  try {
    if (window) {
      return true;
    }
  } catch {}
  return false;
})();
