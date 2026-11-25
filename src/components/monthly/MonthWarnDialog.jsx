import { AlertTriangle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useLanguage } from '@/hooks/useLanguage';
import { cal } from '@/lib/i18n';

// "该月无N号"模态提示：明确告知原因，关闭后提交按钮仍保持禁用
// 【i18n】标题/描述/按钮随语言切换
const MonthWarnDialog = ({ open, onOpenChange, message }) => {
  const { lang } = useLanguage();
  const c = (k) => cal(lang, k);
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-rose-600">
            <AlertTriangle size={18} aria-hidden="true" /> {c('warnTitle')}
          </AlertDialogTitle>
          <AlertDialogDescription>{message}{c('warnFix')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{c('cancel')}</AlertDialogCancel>
          <AlertDialogAction className="bg-rose-500 hover:bg-rose-600">{c('iknow')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default MonthWarnDialog;
