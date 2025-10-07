export function openWithAppFallback(opts: {
  appUrl: string;
  webUrl: string;
  timeoutMs?: number;
  onBeforeNavigate?: () => void;
}): void {
  const { appUrl, webUrl, timeoutMs = 600, onBeforeNavigate } = opts;

  try {
    onBeforeNavigate?.();
  } catch {}

  let didChangeVisibility = false;
  const onVis = () => {
    if (document.visibilityState === 'hidden') didChangeVisibility = true;
  };
  document.addEventListener('visibilitychange', onVis, { once: true });

  const t = setTimeout(() => {
    if (!didChangeVisibility) {
      window.location.href = webUrl;
    }
  }, timeoutMs);

  try {
    window.location.href = appUrl;
  } catch {
    clearTimeout(t);
    window.location.href = webUrl;
  }
}
