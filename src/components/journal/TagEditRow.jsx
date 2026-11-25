import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ColorIconPicker from './ColorIconPicker';
import { useLanguage } from '@/hooks/useLanguage';
import { ed } from '@/lib/i18nEditor';

// 标签编辑行：名称 + 颜色 + 图标一体化编辑（按钮文案随语言切换）
const TagEditRow = ({ value, onChange, onSave, onCancel }) => {
  const { lang } = useLanguage();
  const e = (k) => ed(lang, k);
  return (
    <div className="w-full space-y-1.5">
      <Input value={value.name} onChange={(ev) => onChange({ ...value, name: ev.target.value })}
        className="h-8 border-amber-200" aria-label={e('tagNameAria')} />
      <ColorIconPicker color={value.color} icon={value.icon}
        onColor={(c) => onChange({ ...value, color: c })} onIcon={(i) => onChange({ ...value, icon: i })} />
      <div className="flex gap-1.5">
        <Button size="sm" className="h-7 bg-amber-400 text-white" onClick={onSave}>{e('tagSave')}</Button>
        <Button size="sm" variant="outline" className="h-7" onClick={onCancel}>{e('tagCancel')}</Button>
      </div>
    </div>
  );
};

export default TagEditRow;
