import { useEffect, useState } from 'react';

const KEY = 'journal_op_log';
const MAX = 100; // 最多保留 100 条，防止无限膨胀

const read = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
};

// 追加一条操作日志（标签/事件等关键操作），并通知所有监听组件刷新
export function logOp(action, detail) {
  try {
    const list = read();
    list.unshift({ action, detail, time: new Date().toISOString() });
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
    window.dispatchEvent(new Event('op-log-changed'));
  } catch { /* 忽略存储异常 */ }
}

// 清空全部操作日志
export function clearOpLog() {
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event('op-log-changed'));
  } catch { /* 忽略 */ }
}

// 操作日志读取 Hook：跨页面通过自定义事件同步
export function useOperationLog() {
  const [logs, setLogs] = useState(read);
  useEffect(() => {
    const sync = () => setLogs(read());
    window.addEventListener('op-log-changed', sync);
    return () => window.removeEventListener('op-log-changed', sync);
  }, []);
  return { logs };
}
