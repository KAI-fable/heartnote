import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Tags, ArrowUp, ArrowDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTags } from '@/hooks/useTags';
import { TAG_CATEGORIES, TAG_COLORS, TAG_ICONS } from '@/lib/constants';
import { useLanguage } from '@/hooks/useLanguage';
import { ed } from '@/lib/i18nEditor';
import { logOp } from '@/hooks/useOperationLog';
import TagEditRow from './TagEditRow';
import ColorIconPicker from './ColorIconPicker';

// 标签分类中文名 → i18n key 映射（存储保持中文，展示层翻译）
const CAT_KEY = { '生活': 'catLife', '心情': 'catMood', '工作': 'catWork', '节日': 'catFestival' };

// 标签管理弹窗：自定义命名/颜色/图标，拖拽调整层级顺序（移动端用↑↓按钮）
// 【i18n】标题/占位符/校验与状态提示/分类名随语言切换
const TagManagerDialog = ({ open, onOpenChange }) => {
  const { tags, addTag, updateTag, deleteTag, reorderTag } = useTags();
  const { lang, t } = useLanguage();
  const e = (k) => ed(lang, k);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('生活');
  const [newTag, setNewTag] = useState({ color: TAG_COLORS[0], icon: TAG_ICONS[0] });
  const [editingId, setEditingId] = useState(null);
  const [edit, setEdit] = useState({ name: '', color: TAG_COLORS[0], icon: TAG_ICONS[0] });
  const dragId = useRef(null);

  const handleAdd = () => {
    if (!name.trim()) { toast.error(e('tagNameNeeded')); return; }
    if (addTag(name, category, newTag.color, newTag.icon)) {
      toast.success(`${e('tagCreated')}「${name.trim()}」`); setName('');
    } else toast.error(e('tagNameConflict')); // 重复标签冲突友好提示
  };

  const saveEdit = (id) => {
    const n = edit.name.trim();
    if (!n) { toast.error(e('tagNameEmpty')); return; }
    if (tags.some((tg) => tg.name === n && tg.id !== id)) { toast.error(e('tagNameConflict')); return; }
    updateTag(id, { name: n, color: edit.color, icon: edit.icon });
    logOp('edit_tag', `更新标签「${n}」（颜色/图标/命名）`);
    toast.success(e('tagUpdated')); setEditingId(null);
  };

  const handleDelete = (tg) => {
    deleteTag(tg.id);
    logOp('delete_tag', `删除标签「${tg.name}」`);
    toast.success(e('tagDeleted'));
  };

  // 拖拽放置：拖到目标标签上即插入其前方
  const dropOn = (targetId) => {
    if (dragId.current && dragId.current !== targetId) {
      reorderTag(dragId.current, targetId);
      logOp('reorder_tag', '标签层级顺序已调整');
    }
    dragId.current = null;
  };

  // 移动端兜底：上下按钮调整顺序
  const move = (tg, dir) => {
    const idx = tags.findIndex((x) => x.id === tg.id);
    const target = tags[idx + dir];
    if (target) { reorderTag(tg.id, target.id); logOp('reorder_tag', `标签「${tg.name}」${dir < 0 ? '上移' : '下移'}`); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-1.5 font-hand text-xl text-amber-800">
            <Tags size={18} aria-hidden="true" /> {e('tagsTitle')}
          </DialogTitle>
        </DialogHeader>

        {/* 新建标签：名称 + 分类 + 颜色 + 图标 */}
        <div className="flex gap-2">
          <Input value={name} onChange={(ev) => setName(ev.target.value)} placeholder={e('tagNewPh')} className="border-amber-200" aria-label={e('tagNewPh')} />
          <Button onClick={handleAdd} className="shrink-0 bg-amber-400 text-white hover:bg-amber-500">
            <Plus size={15} aria-hidden="true" /> {e('tagCreate')}
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TAG_CATEGORIES.map((cg) => (
            <button key={cg.name} onClick={() => setCategory(cg.name)} aria-pressed={category === cg.name}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                category === cg.name ? `${cg.chip} border-transparent ring-2 ring-amber-400` : 'border-amber-200 bg-white text-amber-600'
              }`}>{t(CAT_KEY[cg.name] || 'catLife')}</button>
          ))}
        </div>
        <ColorIconPicker color={newTag.color} icon={newTag.icon}
          onColor={(cg) => setNewTag({ ...newTag, color: cg })} onIcon={(i) => setNewTag({ ...newTag, icon: i })} />

        {/* 按分类分组展示，行可拖拽排序 */}
        {TAG_CATEGORIES.map((cg) => {
          const group = tags.filter((tg) => tg.category === cg.name);
          if (!group.length) return null;
          return (
            <div key={cg.name}>
              <p className="mb-1.5 text-xs text-amber-500">{t(CAT_KEY[cg.name] || 'catLife')}</p>
              <div className="space-y-1.5">
                {group.map((tg) => (
                  <div key={tg.id} draggable={editingId !== tg.id}
                    onDragStart={() => { dragId.current = tg.id; }}
                    onDragOver={(ev) => ev.preventDefault()}
                    onDrop={() => dropOn(tg.id)}
                    className="flex items-center gap-2 rounded-xl bg-amber-50/60 px-3 py-2">
                    {editingId === tg.id ? (
                      <TagEditRow value={edit} onChange={setEdit} onSave={() => saveEdit(tg.id)} onCancel={() => setEditingId(null)} />
                    ) : (
                      <>
                        <span className="truncate rounded-full px-2.5 py-0.5 text-xs"
                          style={{ backgroundColor: `${tg.color || TAG_COLORS[0]}33`, color: tg.color || TAG_COLORS[0] }}>
                          {tg.icon || '#'} {tg.name}
                        </span>
                        <button className="ml-auto rounded-lg p-1.5 text-amber-600 hover:bg-amber-100" aria-label={`${e('moveUp')} ${tg.name}`} onClick={() => move(tg, -1)}>
                          <ArrowUp size={13} aria-hidden="true" />
                        </button>
                        <button className="rounded-lg p-1.5 text-amber-600 hover:bg-amber-100" aria-label={`${e('moveDown')} ${tg.name}`} onClick={() => move(tg, 1)}>
                          <ArrowDown size={13} aria-hidden="true" />
                        </button>
                        <button className="rounded-lg p-1.5 text-amber-600 hover:bg-amber-100" aria-label={`${e('editTag')} ${tg.name}`}
                          onClick={() => { setEditingId(tg.id); setEdit({ name: tg.name, color: tg.color || TAG_COLORS[0], icon: tg.icon || TAG_ICONS[0] }); }}>
                          <Pencil size={14} aria-hidden="true" />
                        </button>
                        <button className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50" aria-label={`${e('deleteTag')} ${tg.name}`} onClick={() => handleDelete(tg)}>
                          <Trash2 size={14} aria-hidden="true" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        <p className="text-[10px] text-stone-400">{e('tagsFooterHint')}</p>
      </DialogContent>
    </Dialog>
  );
};

export default TagManagerDialog;
