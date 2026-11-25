import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useLanguage } from '@/hooks/useLanguage';
import { cal } from '@/lib/i18n';

// 删除二次确认弹窗：含"确认删除"与"取消"，删除操作会记录日志与数据库
// 【i18n】标题/描述/按钮随语言切换
const DeleteConfirmDialog = ({ target, onCancel, onConfirm }) => {
  const { lang } = useLanguage();
  const c = (k) => cal(lang, k);
  return (
    <AlertDialog open={!!target} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-hand text-xl text-amber-800">
            {c('delTitle')}「{target?.title}」？
          </AlertDialogTitle>
          <AlertDialogDescription>
            {String(target?.id || '').startsWith('preset_') ? c('presetDesc') : c('customDesc')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>{c('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-rose-500 hover:bg-rose-600">{c('confirmDel')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmDialog;
