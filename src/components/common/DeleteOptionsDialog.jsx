import { Archive, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';

// 删除二次确认 + 方式选择弹窗：软删除（归档可找回）/ 硬删除（物理移除不可恢复）
const DeleteOptionsDialog = ({ target, onCancel, onConfirm }) => {
  const { t } = useLanguage();
  return (
    <Dialog open={!!target} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-hand text-xl text-amber-800">{t('delPickTitle')}</DialogTitle>
          <DialogDescription className="truncate">「{target?.title}」</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <button onClick={() => onConfirm('soft')}
            className="w-full rounded-2xl border border-amber-200 bg-amber-50 p-3 text-left transition hover:bg-amber-100">
            <p className="flex items-center gap-1.5 text-sm text-amber-800">
              <Archive size={15} aria-hidden="true" /> {t('delSoft')}
            </p>
            <p className="mt-1 text-xs text-stone-400">{t('delSoftDesc')}</p>
          </button>
          <button onClick={() => onConfirm('hard')}
            className="w-full rounded-2xl border border-rose-200 bg-rose-50 p-3 text-left transition hover:bg-rose-100">
            <p className="flex items-center gap-1.5 text-sm text-rose-600">
              <Trash2 size={15} aria-hidden="true" /> {t('delHard')}
            </p>
            <p className="mt-1 text-xs text-stone-400">{t('delHardDesc')}</p>
          </button>
          <Button variant="outline" onClick={onCancel} className="w-full">{t('delCancel')}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteOptionsDialog;
