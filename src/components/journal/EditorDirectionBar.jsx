import { MessageSquareWarning } from 'lucide-react';
import { toast } from 'sonner';
import { logOp } from '@/hooks/useOperationLog';
import { trackEvent } from '@/integrations/analytics/tracker';
import { useLanguage } from '@/hooks/useLanguage';
import { ed } from '@/lib/i18nEditor';

// 编辑器底部方向指示条：实时展示主流方向，并提供输入异常反馈通道
// 【i18n】方向说明与反馈按钮随语言切换
const EditorDirectionBar = ({ dir }) => {
  const { lang } = useLanguage();
  const e = (k) => ed(lang, k);
  const DIR_LABEL = { ltr: e('dirLtr'), rtl: e('dirRtl'), neutral: e('dirNeutral') };

  // 用户上报输入异常：留痕日志 + 埋点 + 打开全局反馈弹窗
  const report = () => {
    logOp('input_issue_report', '用户从富文本编辑器上报输入显示异常（方向/乱码/emoji）');
    trackEvent('input_issue_report', { dir });
    window.dispatchEvent(new Event('open-feedback'));
    toast.info(e('reportOpened'));
  };

  return (
    <div className="flex items-center justify-between border-t border-amber-100 bg-amber-50/40 px-2 py-1">
      <span className="text-[10px] text-stone-400" aria-live="polite">{e('dirTextLabel')}：{DIR_LABEL[dir] || DIR_LABEL.neutral}</span>
      <button onClick={report}
        className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] text-amber-500 transition hover:bg-amber-100 hover:text-amber-700">
        <MessageSquareWarning size={12} aria-hidden="true" /> {e('reportIssue')}
      </button>
    </div>
  );
};

export default EditorDirectionBar;
