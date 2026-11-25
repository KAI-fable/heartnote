import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Palette } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TAG_COLORS } from '@/lib/constants';
import { useTags } from '@/hooks/useTags';
import { useSettings } from '@/hooks/useSettings';
import { useLanguage } from '@/hooks/useLanguage';
import { cal } from '@/lib/i18n';
import { tagDisplayName } from '@/lib/tagDisplay';
import { logOp } from '@/hooks/useOperationLog';

// 左侧自定义标签面板：多选后一键批量换色，日历事件颜色同源即时同步（远低于200ms）
// 【i18n】标题/占位符/批量换色指引/状态提示随语言切换；默认标签名随语言偏好翻译
const TagPanel = () => {
  const { tags, addTag, updateTag } = useTags();
  const { lang, isEn } = useLanguage();
  const [settings] = useSettings();
  const c = (k) => cal(lang, k);
  const [name, setName] = useState('');
  const [selected, setSelected] = useState([]);

  const toggle = (id) => setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  // 新建标签：重名冲突触发友好提示（异常场景覆盖）
  const handleAdd = () => {
    if (!name.trim()) { toast.error(c('tagNameNeeded')); return; }
    if (addTag(name.trim(), '生活')) {
      toast.success(isEn ? `Tag "${name.trim()}" created` : `标签「${name.trim()}」已创建`);
      setName('');
    } else toast.error(c('tagConflict'));
  };

  // 批量换色：所有选中标签统一更新，日历事件颜色即刻刷新
  const batchColor = (col) => {
    if (!selected.length) { toast.info(c('pickTagsFirst')); return; }
    selected.forEach((id) => updateTag(id, { color: col }));
    logOp('batch_color', `批量修改 ${selected.length} 个标签颜色为 ${col}`);
    toast.success(isEn ? `${selected.length} tag(s) recolored, calendar synced 🎨` : `已更新 ${selected.length} 个标签，日历事件颜色已同步 🎨`);
  };

  return (
    <section aria-label={c('tagTitle')} className="rounded-2xl border border-amber-100 bg-white/85 p-4">
      <h2 className="flex items-center gap-1.5 font-hand text-lg text-amber-800">
        <Palette size={17} aria-hidden="true" /> {c('tagTitle')}
      </h2>
      <div className="mt-2 flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={c('tagPh')} className="h-9 border-amber-200" aria-label={c('tagAddLabel')} />
        <Button size="sm" onClick={handleAdd} className="h-9 shrink-0 bg-amber-400 text-white hover:bg-amber-500" aria-label={c('tagAddLabel')}>
          <Plus size={14} aria-hidden="true" />
        </Button>
      </div>
      <ul className="mt-3 max-h-44 space-y-1.5 overflow-y-auto">
        {tags.map((t) => (
          <li key={t.id}>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-amber-50/60 px-2.5 py-1.5 text-sm">
              <input type="checkbox" checked={selected.includes(t.id)} onChange={() => toggle(t.id)} className="accent-amber-500" aria-label={`${isEn ? 'Select tag' : '选择标签'} ${t.name}`} />
              <span className="rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: `${t.color}33`, color: t.color }}>
                {t.icon || '#'} {tagDisplayName(t, lang, settings.defaultTagLang)}
              </span>
            </label>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[10px] text-amber-500">{c('batchColorHint')}</p>
      <div className="mt-1.5 flex gap-1.5">
        {TAG_COLORS.map((col) => (
          <button key={col} onClick={() => batchColor(col)} aria-label={`${isEn ? 'Set color' : '批量设置为颜色'} ${col}`}
            className="h-6 w-6 rounded-full transition hover:scale-110" style={{ backgroundColor: col }} />
        ))}
      </div>
    </section>
  );
};

export default TagPanel;
