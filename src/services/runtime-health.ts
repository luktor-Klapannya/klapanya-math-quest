export type RuntimeIssue = {
  id: string;
  occurredAt: string;
  page: string;
  message: string;
  source: 'window-error' | 'unhandled-rejection' | 'asset-error';
};

const STORAGE_KEY = 'klapanya.runtime-issues.v1';
const MAX_ISSUES = 20;

export function readRuntimeIssues(): RuntimeIssue[] {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function recordRuntimeIssue(message: string, source: RuntimeIssue['source'] = 'asset-error') {
  const issue: RuntimeIssue = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    occurredAt: new Date().toISOString(),
    page: `${location.pathname}${location.hash}`,
    message: message.slice(0, 300),
    source,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([issue, ...readRuntimeIssues()].slice(0, MAX_ISSUES)));
  window.dispatchEvent(new Event('klapanya-runtime-issue'));
}

export function clearRuntimeIssues() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('klapanya-runtime-issue'));
}

export function installRuntimeHealthMonitor() {
  window.addEventListener('error', event => {
    const target = event.target instanceof HTMLElement ? event.target : null;
    if (target && (target.tagName === 'IMG' || target.tagName === 'SOURCE')) {
      const path = (target as HTMLImageElement).currentSrc || (target as HTMLImageElement).src || 'unknown asset';
      recordRuntimeIssue(`โหลดภาพไม่สำเร็จ: ${path}`, 'asset-error');
      return;
    }
    recordRuntimeIssue(event.message || 'เกิดข้อผิดพลาดในหน้าเกม', 'window-error');
  }, true);
  window.addEventListener('unhandledrejection', event => {
    const reason = event.reason instanceof Error ? event.reason.message : String(event.reason || 'Unknown rejection');
    recordRuntimeIssue(reason, 'unhandled-rejection');
  });
}
