import { useState } from 'react';
import { Search } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import EntryCard from '@/components/journal/EntryCard';
import EntryEditorDialog from '@/components/journal/EntryEditorDialog';
import DeleteOptionsDialog from '@/components/common/DeleteOptionsDialog';
import { useJournalEntries } from '@/hooks/useJournalEntries';
import { useLanguage } from '@/hooks/useLanguage';
import { Input } from '@/components/ui/input';

// 历史回顾页：全部手账卡片流 + 关键词搜索 + 软删/硬删双模式删除
const HistoryPage = () => {
  const { t } = useLanguage();
  const { data: entries = [], isLoading, updateEntry, deleteEntry } = useJournalEntries();
  const [editing, setEditing] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null); // 待删除手账（弹窗确认中）

  const filtered = entries.filter((e) =>
    (e.title || '').includes(keyword) ||
    (e.content || '').includes(keyword) ||
    (e.tags || []).some((tg) => tg.includes(keyword))
  );

  const openEdit = (entry) => { setEditing(entry); setEditorOpen(true); };

  // 确认删除：mode='soft' 归档 / mode='hard' 物理删除，日志与 toast 由数据层统一处理
  const confirmDelete = (mode) => {
    if (!deleteTarget) return;
    deleteEntry.mutate({ id: deleteTarget.id, mode });
    setDeleteTarget(null);
  };

  return (
    <PageShell title={`${t('navHistory')} 🕰️`}>
      <div className="space-y-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" aria-hidden="true" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            aria-label={t('navHistory')}
            placeholder={t('navHistory') + '...'}
            className="pl-9 border-amber-200 bg-white/85"
          />
        </div>
        {isLoading ? (
          <p className="py-16 text-center text-sm text-stone-400">{t('loading')}</p>
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-stone-400">{t('noEntry')}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
                onTogglePin={(e) => updateEntry.mutate({ id: e.id, is_pinned: !e.is_pinned })}
              />
            ))}
          </div>
        )}
      </div>
      <EntryEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        entry={editing}
        onSave={(data) => {
          if (editing) updateEntry.mutate({ id: editing.id, ...data });
          setEditorOpen(false);
        }}
      />
      <DeleteOptionsDialog target={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} />
    </PageShell>
  );
};

export default HistoryPage;
