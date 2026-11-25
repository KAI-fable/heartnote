import { format } from 'date-fns';
import { nthWeekdayOfMonth, lunarToSolarInYear } from './dateRules';

const HIDDEN_KEY = 'journal_hidden_presets';
const iso = (d) => format(d, 'yyyy-MM-dd');

const readHidden = () => {
  try { return JSON.parse(localStorage.getItem(HIDDEN_KEY)) || []; } catch { return []; }
};
const writeHidden = (list) => {
  try { localStorage.setItem(HIDDEN_KEY, JSON.stringify(list)); } catch { /* 忽略 */ }
};

// 系统预置纪念日（按年重复）：情人节为固定公历日；七夕为农历七月初七（动态转公历，
// 如 2026 年正确为 8 月 19 日，不再硬编码 8 月 7 日）；父亲节/母亲节为浮动周日
const buildPresets = (year) => {
  // 农历 → 公历动态转换；转换失败时回落近似公历日期作为兜底
  const qixi = lunarToSolarInYear(year, 7, 7);
  return [
    { id: 'preset_valentines', title: '情人节', emoji: '💝', event_type: '纪念日', repeat_rule: 'yearly', tags: ['节日'], event_date: `${year}-02-14` },
    { id: 'preset_qixi', title: '七夕节', emoji: '🎋', event_type: '纪念日', repeat_rule: 'yearly', tags: ['节日'], event_date: qixi ? iso(qixi) : `${year}-08-07`, lunar: { m: 7, d: 7 } },
    { id: 'preset_fathers', title: '父亲节', emoji: '👔', event_type: '纪念日', repeat_rule: 'yearly', tags: ['节日'], event_date: iso(nthWeekdayOfMonth(year, 6, 0, 3)) },
    { id: 'preset_mothers', title: '母亲节', emoji: '💐', event_type: '纪念日', repeat_rule: 'yearly', tags: ['节日'], event_date: iso(nthWeekdayOfMonth(year, 5, 0, 2)) },
  ];
};

// 获取未被用户删除的预置纪念日
export function getPresetEvents(year = new Date().getFullYear()) {
  return buildPresets(year).filter((p) => !readHidden().includes(p.id));
}

// 手动删除预置纪念日（本地隐藏，不污染云端数据）
export function hidePreset(id) {
  const hidden = readHidden();
  if (!hidden.includes(id)) writeHidden([...hidden, id]);
}

// 恢复全部预置纪念日
export function restorePresets() {
  writeHidden([]);
}
