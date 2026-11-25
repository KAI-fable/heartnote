import { format } from 'date-fns';

// 手账卡片列表：与日历联动，点击卡片即联动高亮该手账对应日期
const JournalLinkedCard = ({ entries, onPick }) => {
  if (!entries.length) {
    return <p className="rounded-2xl border border-amber-100 bg-white/85 p-4 text-center text-sm text-stone-400">这一天还没有手账记录 🥺</p>;
  }
  return (
    <div className="space-y-2">
      {entries.map((en) => (
        <button key={en.id} onClick={() => onPick?.(en)} aria-label={`查看手账 ${en.title || '无标题'}`}
          className="w-full rounded-2xl border border-amber-100 bg-white/85 p-3 text-left transition hover:ring-2 hover:ring-amber-300">
          <div className="flex items-center gap-2">
            <span aria-hidden="true">{en.mood}</span>
            <p className="truncate text-sm text-stone-700">{en.title || '无标题手账'}</p>
            <span className="ml-auto text-[10px] text-amber-400">{format(new Date(en.created_at), 'HH:mm')}</span>
          </div>
          {(en.tags || []).length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {en.tags.map((t) => (
                <span key={t} className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-700">#{t}</span>
              ))}
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default JournalLinkedCard;
