import { format } from 'date-fns';
import { useLanguage } from '@/hooks/useLanguage';

// 手账卡片：便签样式 + 置顶/编辑/删除操作栏（删除走删除方式选择弹窗）
const EntryCard = ({ entry, onEdit, onDelete, onTogglePin }) => {
  const { t, isEn } = useLanguage();
  return (
    <div className="relative bg-white/85 rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
      {/* 顶部胶带装饰条 */}
      <div className="h-2 bg-gradient-to-r from-pink-200 via-amber-200 to-sky-200" />
      <div className="p-4">
        <div className="flex items-center gap-2 flex-wrap">
          {entry.is_pinned && <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">{t('pinnedTag')}</span>}
          <h3 className="font-hand text-lg text-stone-800">{entry.mood} {entry.title || t('untitled')}</h3>
          <span className="ml-auto text-xs text-amber-400">
            {format(new Date(entry.created_at), isEn ? 'MMM d, yyyy HH:mm' : 'M月d日 HH:mm')}
          </span>
        </div>
        {(entry.tags || []).length > 0 && (
          <div className="flex gap-1.5 mt-1.5 flex-wrap">
            {entry.tags.map((tg) => (
              <span key={tg} className="text-[11px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">#{tg}</span>
            ))}
          </div>
        )}
        <div className="rich-content mt-2 text-sm text-stone-600" dangerouslySetInnerHTML={{ __html: entry.content || '' }} />
        {/* 拇指热区操作栏 */}
        <div className="flex justify-end gap-2 mt-3">
          <button onClick={() => onTogglePin(entry)} className="px-3 py-2 rounded-xl bg-amber-50 text-amber-700 text-sm" aria-label={t('pin')}>📌</button>
          <button onClick={() => onEdit(entry)} className="px-3 py-2 rounded-xl bg-sky-50 text-sky-700 text-sm">✏️ {t('edit')}</button>
          <button onClick={() => onDelete(entry)} className="px-3 py-2 rounded-xl bg-rose-50 text-rose-600 text-sm">🗑️ {t('del')}</button>
        </div>
      </div>
    </div>
  );
};

export default EntryCard;
