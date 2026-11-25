import { Star, Pencil } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSettings } from '@/hooks/useSettings';
import { tagDisplayName } from '@/lib/tagDisplay';
import { ed } from '@/lib/i18nEditor';

// 标签芯片：视觉区分默认项与自定义项——
// 默认标签带 ⭐ 角标（随语言偏好显示英文），自定义标签带 ✎ 角标（保留原语言）；
// 悬浮提示明确说明差异，选中态高亮
const TagChip = ({ tag, active = false, onClick, activeCls = 'bg-amber-200 text-amber-800' }) => {
  const { lang } = useLanguage();
  const [settings] = useSettings();
  const e = (k) => ed(lang, k);
  const name = tagDisplayName(tag, lang, settings.defaultTagLang);
  const tip = tag.isDefault ? e('defaultTagTip') : e('customTagTip');
  return (
    <button type="button" onClick={onClick} aria-pressed={active} title={tip}
      className={`rounded-full border px-3 py-1.5 text-xs transition ${
        active ? `${activeCls} border-transparent ring-2 ring-amber-400` : 'border-amber-200 bg-white text-amber-600'
      }`}>
      #{name}
      {tag.isDefault
        ? <Star size={9} className="ml-1 inline text-amber-400" aria-hidden="true" />
        : <Pencil size={9} className="ml-1 inline text-sky-400" aria-hidden="true" />}
    </button>
  );
};

export default TagChip;
