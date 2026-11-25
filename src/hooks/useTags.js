import { useCallback, useEffect, useState } from 'react';
import { logOp } from './useOperationLog';

const KEY = 'journal_tags';

// 默认种子标签：isDefault 标记 + 中英双名（name/nameEn），
// 展示层按语言偏好翻译；数据库与手账引用的 canonical name 保持中文不变
const DEFAULT_TAGS = [
  { id: 't_mood', name: '心情', nameEn: 'Mood', isDefault: true, category: '心情', color: '#fb7185', icon: '🌷' },
  { id: 't_food', name: '美食', nameEn: 'Food', isDefault: true, category: '生活', color: '#f97316', icon: '🍔' },
  { id: 't_travel', name: '旅行', nameEn: 'Travel', isDefault: true, category: '生活', color: '#60a5fa', icon: '✈️' },
  { id: 't_sport', name: '运动', nameEn: 'Sport', isDefault: true, category: '生活', color: '#34d399', icon: '🏃' },
  { id: 't_note', name: '随笔', nameEn: 'Notes', isDefault: true, category: '生活', color: '#a78bfa', icon: '📝' },
  { id: 't_work', name: '工作', nameEn: 'Work', isDefault: true, category: '工作', color: '#fbbf24', icon: '💼' },
  { id: 't_anniv', name: '纪念日', nameEn: 'Anniversary', isDefault: true, category: '节日', color: '#fb7185', icon: '🎉' },
];

const read = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || DEFAULT_TAGS; }
  catch { return DEFAULT_TAGS; }
};

// 全局自定义标签管理：手账与重要日子共用同一标签池，跨页面事件同步
export function useTags() {
  const [tags, setTags] = useState(read);

  useEffect(() => {
    const sync = () => setTags(read());
    window.addEventListener('tags-changed', sync);
    return () => window.removeEventListener('tags-changed', sync);
  }, []);

  const persist = (next) => {
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event('tags-changed'));
  };

  // 用户主动创建的标签：不带 isDefault / nameEn，属于自定义项，保留原语言
  const addTag = useCallback((name, category = '生活', color = '#fbbf24', icon = '⭐') => {
    const n = (name || '').trim();
    if (!n) return false;
    if (read().some((t) => t.name === n)) {
      logOp('tag_conflict', `创建标签冲突：已存在同名标签「${n}」`);
      return false;
    }
    persist([...read(), { id: `t_${Date.now()}`, name: n, category, color, icon }]);
    logOp('add_tag', `创建标签「${n}」（${category}）`);
    return true;
  }, []);

  const updateTag = useCallback((id, patch) => {
    persist(read().map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const deleteTag = useCallback((id) => {
    persist(read().filter((t) => t.id !== id));
  }, []);

  // 拖拽排序：将 dragId 移动到 targetId 之前，全列表顺序即层级顺序
  const reorderTag = useCallback((dragId, targetId) => {
    const list = read();
    const from = list.findIndex((t) => t.id === dragId);
    const to = list.findIndex((t) => t.id === targetId);
    if (from < 0 || to < 0 || from === to) return;
    const [item] = list.splice(from, 1);
    list.splice(to, 0, item);
    persist(list);
  }, []);

  return { tags, addTag, updateTag, deleteTag, reorderTag };
}
