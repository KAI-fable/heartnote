const PREFIX = 'journal_backup_';

// 本地备份读取（云端异常时的数据兜底）
export function readLocal(key) {
  try { return JSON.parse(localStorage.getItem(PREFIX + key)) || []; } catch { return []; }
}

// 本地备份写入
export function saveLocal(key, data) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(data)); } catch { /* 忽略存储异常 */ }
}

// 清空全部本地备份
export function clearLocal() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(PREFIX))
    .forEach((k) => localStorage.removeItem(k));
}
