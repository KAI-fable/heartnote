import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Settings2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import RichTextEditor from './RichTextEditor';
import TagManagerDialog from './TagManagerDialog';
import TagChip from '@/components/common/TagChip';
import { useTags } from '@/hooks/useTags';
import { useLanguage } from '@/hooks/useLanguage';
import { ed } from '@/lib/i18nEditor';

const MOODS = ['😊', '🥰', '😢', '😌', '🤩', '😴'];

// 手账编辑弹窗：标题 / 心情 / 富文本 / 标签选择（默认标签随语言翻译，自定义标签保留原语言）
const EntryEditorDialog = ({ open, onOpenChange, entry, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [mood, setMood] = useState('😊');
  const [manageOpen, setManageOpen] = useState(false);
  const { tags: allTags } = useTags();
  const { lang } = useLanguage();
  const e = (k) => ed(lang, k);

  useEffect(() => {
    if (open) {
      setTitle(entry?.title || '');
      setContent(entry?.content || '');
      setTags(entry?.tags || []);
      setMood(entry?.mood || '😊');
    }
  }, [open, entry]);

  const toggleTag = (name) =>
    setTags((prev) => (prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]));

  const handleSave = () => {
    if (!title.trim() && !content.trim()) { toast.error(e('entryEmptyWarn')); return; }
    onSave({ title: title.trim(), content, tags, mood });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-hand text-xl text-amber-800">
            {entry ? e('entryEditTitle') : e('entryNewTitle')}
          </DialogTitle>
        </DialogHeader>
        <Input placeholder={e('entryTitlePh')} value={title} aria-label={e('entryTitlePh')}
          onChange={(ev) => setTitle(ev.target.value)} className="border-amber-200" />
        <div className="flex flex-wrap gap-1.5">
          {MOODS.map((m) => (
            <button key={m} onClick={() => setMood(m)} aria-pressed={mood === m} aria-label={m}
              className={`h-9 w-9 rounded-full text-xl transition ${mood === m ? 'bg-amber-200 ring-2 ring-amber-400' : 'bg-stone-100'}`}>
              {m}
            </button>
          ))}
        </div>
        <RichTextEditor key={open ? (entry?.id || 'new') : 'closed'} value={content} onChange={setContent} />

        {/* 标签区：默认标签带 ⭐、自定义标签带 ✎，悬浮显示说明，随语言偏好翻译 */}
        <div>
          <div className="flex items-center">
            <p className="text-xs text-amber-600">{e('entryTagsLabel')}</p>
            <button onClick={() => setManageOpen(true)} aria-label={e('manageTags')}
              className="ml-auto flex items-center gap-1 text-xs text-amber-500 hover:text-amber-700">
              <Settings2 size={13} aria-hidden="true" /> {e('manageTags')}
            </button>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {allTags.map((tg) => (
              <TagChip key={tg.id} tag={tg} active={tags.includes(tg.name)} onClick={() => toggleTag(tg.name)} />
            ))}
          </div>
        </div>

        <Button onClick={handleSave} className="h-12 w-full bg-amber-400 text-base text-white hover:bg-amber-500">
          {e('saveEntry')}
        </Button>
        <TagManagerDialog open={manageOpen} onOpenChange={setManageOpen} />
      </DialogContent>
    </Dialog>
  );
};

export default EntryEditorDialog;
