import { TAG_COLORS, TAG_ICONS } from '@/lib/constants';
import { useLanguage } from '@/hooks/useLanguage';
import { ed } from '@/lib/i18nEditor';

// 颜色与图标选择器：新建/编辑标签共用，支持自定义颜色与图标配置（提示随语言切换）
const ColorIconPicker = ({ color, icon, onColor, onIcon }) => {
  const { lang } = useLanguage();
  const e = (k) => ed(lang, k);
  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="text-[10px] text-amber-500">{e('colorLabel')}</span>
      {TAG_COLORS.map((c) => (
        <button key={c} type="button" onClick={() => onColor(c)} aria-label={`${e('colorLabel')} ${c}`}
          aria-pressed={color === c}
          className={`h-5 w-5 rounded-full transition ${color === c ? 'ring-2 ring-amber-500' : ''}`}
          style={{ backgroundColor: c }} />
      ))}
      <span className="ml-2 text-[10px] text-amber-500">{e('iconLabel')}</span>
      {TAG_ICONS.map((ic) => (
        <button key={ic} type="button" onClick={() => onIcon(ic)} aria-label={`${e('iconLabel')} ${ic}`}
          aria-pressed={icon === ic}
          className={`rounded px-1 text-sm transition ${icon === ic ? 'bg-amber-200' : ''}`}>{ic}</button>
      ))}
    </div>
  );
};

export default ColorIconPicker;
