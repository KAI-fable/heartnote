import { format } from 'date-fns';
import { solarToLunar } from './lunar';

export const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// 时区安全解析：'yyyy-MM-dd' 一律按本地时区午夜解析，避免被当作 UTC 导致日期偏移一天
export function parseLocalDate(v) {
  if (v instanceof Date) return v;
  const m = String(v || '').match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  return m ? new Date(+m[1], m[2] - 1, +m[3]) : new Date(v);
}

// 某月天数（month 传 1-12），闰年由 Date 引擎自动处理（2024年2月=29天）
export const daysInMonth = (y, m) => new Date(y, m, 0).getDate();

// 日期合法性校验：拦截 9.31 这类当月不存在的日期
export const isValidMonthDay = (y, m, d) =>
  m >= 1 && m <= 12 && d >= 1 && d <= daysInMonth(y, m);

// 按年重复的下一次日期：已过则顺延一年；闰年2.29在平年自动钳制为2.28
export function nextYearlyOccurrence(dateStr, from = new Date()) {
  const base = parseLocalDate(dateStr);
  const m = base.getMonth();
  const day = base.getDate();
  let y = from.getFullYear();
  let next = new Date(y, m, Math.min(day, daysInMonth(y, m + 1)));
  if (next < startOfDay(from)) next = new Date(y + 1, m, Math.min(day, daysInMonth(y + 1, m + 1)));
  return next;
}

// 按月重复的下一次日期：当月无此日自动取当月最后一天；12.31跨年进位到次年1月
export function nextMonthlyOccurrence(dateStr, from = new Date()) {
  const day = parseLocalDate(dateStr).getDate();
  let y = from.getFullYear();
  let m = from.getMonth();
  let next = new Date(y, m, Math.min(day, daysInMonth(y, m + 1)));
  if (next < startOfDay(from)) {
    m += 1;
    if (m > 11) { m = 0; y += 1; }
    next = new Date(y, m, Math.min(day, daysInMonth(y, m + 1)));
  }
  return next;
}

// 统一入口：按事件重复规则计算下一次发生日期（单次事件返回原日期，本地时区解析）
// 【农历节日】事件携带 lunar: { m, d }（如七夕 = 农历七月初七）时，
// 动态调用 lunarToSolarInYear 转公历：当年未过取当年，已过自动顺延次年（彻底解决跨年错算）
export function nextOccurrence(ev, from = new Date()) {
  if (ev.lunar && ev.lunar.m && ev.lunar.d) {
    const thisYear = lunarToSolarInYear(from.getFullYear(), ev.lunar.m, ev.lunar.d);
    if (thisYear && startOfDay(thisYear) >= startOfDay(from)) return thisYear;
    const nextYear = lunarToSolarInYear(from.getFullYear() + 1, ev.lunar.m, ev.lunar.d);
    if (nextYear) return nextYear;
  }
  if (ev.repeat_rule === 'yearly') return nextYearlyOccurrence(ev.event_date, from);
  if (ev.repeat_rule === 'monthly') return nextMonthlyOccurrence(ev.event_date, from);
  return parseLocalDate(ev.event_date);
}

// 重复周期文案："每年2.14" / "Yearly · Feb 14"
export function repeatLabel(ev, lang = 'zh') {
  const d = parseLocalDate(ev.event_date);
  if (ev.repeat_rule === 'yearly')
    return lang === 'en' ? `Yearly · ${format(d, 'MMM d')}` : `每年${d.getMonth() + 1}.${d.getDate()}`;
  if (ev.repeat_rule === 'monthly')
    return lang === 'en' ? `Monthly · day ${d.getDate()}` : `每月${d.getDate()}日`;
  return lang === 'en' ? 'One-time' : '单次';
}

// 农历日期转当年公历（用于七夕等农历节日），逐日反查，稳健无溢出
export function lunarToSolarInYear(year, lunarMonth, lunarDay) {
  for (let day = 0; day < 380; day++) {
    const d = new Date(year, 0, 1 + day);
    if (d.getFullYear() !== year) return null;
    const l = solarToLunar(d);
    if (!l.isLeapMonth && l.month === lunarMonth && l.day === lunarDay) return d;
  }
  return null;
}

// 某月第 n 个星期几（weekday: 0=周日），用于父亲节（6月第3个周日）/母亲节（5月第2个周日）
export function nthWeekdayOfMonth(year, month, weekday, n) {
  const first = new Date(year, month - 1, 1);
  const offset = (weekday - first.getDay() + 7) % 7;
  return new Date(year, month - 1, 1 + offset + (n - 1) * 7);
}

// 事件在指定月份内的发生日期（日历打点用，大小月/闰年自动钳制，时区安全解析）
export function occurrencesInMonth(ev, monthDate) {
  const y = monthDate.getFullYear();
  const m = monthDate.getMonth();
  const out = [];
  const push = (date) => { if (date.getFullYear() === y && date.getMonth() === m) out.push(date); };
  const base = parseLocalDate(ev.event_date);
  if (ev.repeat_rule === 'monthly') {
    push(new Date(y, m, Math.min(base.getDate(), daysInMonth(y, m + 1))));
  } else if (ev.repeat_rule === 'yearly') {
    if (base.getMonth() === m) push(new Date(y, m, Math.min(base.getDate(), daysInMonth(y, m + 1))));
  } else {
    push(base);
  }
  return out;
}
