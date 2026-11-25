import { supabase } from '@/integrations/supabase/client';

const FLUSH_SIZE = 5;      // 缓冲满 5 条触发上报
const FLUSH_DELAY = 3000;  // 或 3 秒防抖批量上报
const LOCAL_KEY = 'analytics_pending';
let buffer = [];
let timer = null;

// 会话级用户标识（sessionStorage，关闭浏览器即失效）
function sessionId() {
  let id = sessionStorage.getItem('analytics_sid');
  if (!id) {
    id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem('analytics_sid', id);
  }
  return id;
}

function savePending(list) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(list)); } catch { /* 忽略 */ }
}
function loadPending() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) || []; } catch { return []; }
}

// 【后端事件回调接口预留】目前批量写入 Supabase；
// 若接入自有后端，把 supabase.insert 替换为 fetch(endpoint, { body: batch }) 即可
async function flush() {
  if (!buffer.length) return;
  const batch = buffer.splice(0, buffer.length);
  try {
    const { error } = await supabase.from('analytics_events').insert(batch);
    if (error) throw error;
  } catch {
    // 上报失败：本地兜底，下次启动补传
    savePending([...loadPending(), ...batch]);
  }
}

function schedule() {
  clearTimeout(timer);
  timer = setTimeout(flush, FLUSH_DELAY);
  if (buffer.length >= FLUSH_SIZE) flush();
}

// 核心埋点方法：trackEvent('click', { zone: 'quick_write' })
export function trackEvent(name, props = {}) {
  buffer.push({
    event_name: name,
    props,
    page_path: location.hash.slice(1) || '/',
    session_id: sessionId(),
    created_at: new Date().toISOString(),
  });
  schedule();
}

// 应用启动时补传历史失败批次
export function initAnalytics() {
  const pending = loadPending();
  if (pending.length) {
    buffer.push(...pending.splice(0, 20));
    localStorage.removeItem(LOCAL_KEY);
    schedule();
  }
}
