import { useEffect, useRef, useState } from 'react';
import { Bold, Italic, Underline, ImagePlus, Sticker } from 'lucide-react';
import { toast } from 'sonner';
import { detectDirection, containsBiDiMarks, stripBiDiMarks } from '@/lib/textDirection';
import { logOp } from '@/hooks/useOperationLog';
import { trackEvent } from '@/integrations/analytics/tracker';
import { useLanguage } from '@/hooks/useLanguage';
import { ed } from '@/lib/i18nEditor';
import EditorDirectionBar from './EditorDirectionBar';

const PRESET_TAGS = ['心情', '美食', '旅行', '工作', '运动', '随笔'];
const TAG_COLORS = {
  心情: 'bg-pink-200 text-pink-700', 美食: 'bg-orange-200 text-orange-700',
  旅行: 'bg-sky-200 text-sky-700', 工作: 'bg-emerald-200 text-emerald-700',
  运动: 'bg-violet-200 text-violet-700', 随笔: 'bg-amber-200 text-amber-700',
};

// 手账风富文本编辑器：IME 组合锁保护中文连续输入 + BiDi 方向自适应 + 隐形标记清洗
// 【i18n】工具条标签 / 占位符 / 图片提示 / 状态 toast 随语言切换
const RichTextEditor = ({ value, onChange }) => {
  const ref = useRef(null);
  const [dir, setDir] = useState('neutral');
  const composing = useRef(false); // 输入法组合锁：拼音/五笔/手写组合期间挂起一切干预
  const { lang } = useLanguage();
  const e = (k) => ed(lang, k);

  // 【关键修复】仅在挂载时注入一次初始内容，React 后续重渲染不再重写编辑区 DOM，
  // 避免受控渲染导致的光标丢失与组合输入被强制中断
  useEffect(() => {
    if (ref.current && !ref.current.innerHTML) ref.current.innerHTML = value || '';
    setDir(detectDirection(ref.current?.innerText || ''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sync = () => { if (!composing.current) onChange?.(ref.current?.innerHTML || ''); };

  // 输入审计：组合期间绝不触碰编辑区（保证汉字输入流不被中断），结束后统一执行
  const audit = () => {
    if (composing.current) return;
    const raw = ref.current?.textContent || '';
    if (containsBiDiMarks(raw)) {
      ref.current.innerHTML = stripBiDiMarks(ref.current.innerHTML);
      logOp('input_bidi_clean', '检测并清除隐形双向控制标记（防镜像翻转/乱码）');
      trackEvent('input_anomaly', { type: 'bidi_marks' });
      toast.warning(e('bidiCleaned'));
    }
    setDir(detectDirection(ref.current?.innerText || ''));
    sync();
  };

  // 输入法组合生命周期：开始加锁 → 结束解锁并一次性提交（候选词字母不再残留正文）
  const onCompositionStart = () => { composing.current = true; };
  const onCompositionEnd = () => { composing.current = false; audit(); };

  const onPaste = (ev) => {
    ev.preventDefault();
    const text = stripBiDiMarks(ev.clipboardData?.getData('text/plain') || '');
    document.execCommand('insertHTML', false, text.replace(/\n/g, '<br/>'));
    audit();
  };

  const exec = (cmd) => { document.execCommand(cmd, false); audit(); };
  const insertHTML = (html) => { document.execCommand('insertHTML', false, html); audit(); };

  // 贴纸标签为静态装饰内容：插入固定样式标签（动态提示文案已随语言切换）
  const insertTag = (t) =>
    insertHTML(`<span class="inline-block px-2 py-0.5 rounded-full text-xs ${TAG_COLORS[t]}" contenteditable="false">#${t}</span>&nbsp;`);

  const insertImage = () => {
    const url = window.prompt(e('imgPrompt'));
    const src = (url || '').trim() || 'https://nocode.meituan.com/photo/search?keyword=手账,插画,清新&width=600&height=400';
    insertHTML(`<img src="${src}" alt="手账插图" />`);
  };

  const tools = [
    { icon: Bold, act: () => exec('bold'), label: e('richBold') },
    { icon: Italic, act: () => exec('italic'), label: e('richItalic') },
    { icon: Underline, act: () => exec('underline'), label: e('richUnderline') },
    { icon: Sticker, act: () => insertTag(PRESET_TAGS[Math.floor(Math.random() * PRESET_TAGS.length)]), label: e('richSticker') },
    { icon: ImagePlus, act: insertImage, label: e('richImage') },
  ];

  return (
    <div className="rounded-xl border border-amber-200 bg-white overflow-hidden">
      <div className="flex gap-1 px-2 py-1.5 border-b border-amber-100 bg-amber-50/60">
        {tools.map(({ icon: Icon, act, label }) => (
          <button key={label} type="button" onMouseDown={(ev) => ev.preventDefault()} onClick={act} title={label} aria-label={label}
            className="p-2 rounded-lg hover:bg-amber-100 text-amber-600">
            <Icon size={16} />
          </button>
        ))}
        <span className="ml-auto self-center text-[10px] text-amber-300">{e('richToolsHint')}</span>
      </div>
      {/* 组合期间不触发任何重排，dir 属性仅在组合结束后更新，实现文本流自适应 */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        dir={dir === 'rtl' ? 'rtl' : 'ltr'}
        onInput={audit}
        onCompositionStart={onCompositionStart}
        onCompositionEnd={onCompositionEnd}
        onBlur={audit}
        onPaste={onPaste}
        className="rich-content min-h-28 p-3 text-sm text-stone-700 outline-none"
        data-placeholder={e('richPlaceholder')}
      />
      <EditorDirectionBar dir={dir} />
    </div>
  );
};

export default RichTextEditor;
