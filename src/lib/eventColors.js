import { solarToLunar } from './lunar';

const STEMS = '甲乙丙丁戊己庚辛壬癸';
const BRANCHES = '子丑寅卯辰巳午未申酉戌亥';

// 干支年：如 2019 → 己亥（用于农历悬浮提示）
export function ganZhiYear(y) {
  return STEMS[(y - 4) % 10] + BRANCHES[(y - 4) % 12];
}

// 节日专属配色：父亲节-深蓝 / 母亲节-浅粉 / 情人节-红色 / 七夕节-金色
export const FESTIVAL_COLORS = {
  preset_fathers: '#1e40af',
  preset_mothers: '#f9a8d4',
  preset_valentines: '#ef4444',
  preset_qixi: '#f59e0b',
};
// 系统默认=蓝色，用户自定义=绿色
export const SYSTEM_COLOR = '#3b82f6';
export const USER_COLOR = '#22c55e';

// 事件着色：预置节日走专属色，其余预设=系统蓝，自定义事件优先标签色、无标签=绿色
export function eventColor(ev, tags) {
  if (FESTIVAL_COLORS[ev.id]) return FESTIVAL_COLORS[ev.id];
  if (String(ev.id).startsWith('preset_')) return SYSTEM_COLOR;
  const tag = (ev.tags || []).map((n) => tags.find((x) => x.name === n)).find(Boolean);
  return tag?.color || USER_COLOR;
}

// 悬浮提示文案：干支年 + 农历日期，如"己亥年五月初七"
export function lunarTip(date) {
  const l = solarToLunar(date);
  const leap = l.isLeapMonth ? '（闰）' : '';
  return `${ganZhiYear(l.year)}年${leap}${l.monthName}${l.dayName}`;
}
