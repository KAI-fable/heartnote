// 农历与节假日转换工具（基于经典农历数据表 1900-2049）
const LUNAR_INFO = [
0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,//1900-1909
0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,//1910-1919
0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,//1920-1929
0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,//1930-1939
0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,//1940-1949
0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0,//1950-1959
0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,//1960-1969
0x096d0,0x0dd75,0x04bd0,0x0a9d8,0x0a4d0,0x0d250,0x0d255,0x0b540,0x0d6a0,0x0ada2,//1970-1979
0x095b0,0x14977,0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,//1980-1989
0x052f2,0x04970,0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,//1990-1999
0x1c8d7,0x0c950,0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,//2000-2009
0x0a950,0x0b557,0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,//2010-2019
0x0e950,0x06aa0,0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,//2020-2029
0x05b57,0x056a0,0x096d0,0x0dd75,0x04bd0,0x0a9d8,0x0a4d0,0x0d250,0x0d255,0x0b540,//2030-2039
0x0d6a0,0x0ada2,0x095b0,0x14977,0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54 //2040-2049
];

const MONTH_NAMES = ['正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','冬月','腊月'];
const DAY_NAMES = ['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十','十一','十二','十三','十四','十五','十六','十七','十八','十九','二十','廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];

// 农历某月天数（29 或 30）
function monthDays(y, m) { return (LUNAR_INFO[y - 1900] & (0x10000 >> m)) ? 30 : 29; }
// 农历闰月月份（0 表示无闰月）
function leapMonth(y) { return LUNAR_INFO[y - 1900] & 0xf; }
function leapDays(y) { return leapMonth(y) ? ((LUNAR_INFO[y - 1900] & 0x10000) ? 30 : 29) : 0; }
// 农历某年总天数
function lunarYearDays(y) {
  let sum = 348;
  for (let i = 0x8000; i > 0x8; i >>= 1) if (LUNAR_INFO[y - 1900] & i) sum++;
  return sum + leapDays(y);
}

// 公历转农历
export function solarToLunar(date) {
  let offset = Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(1900, 0, 31)) / 86400000);
  let year, temp = 0;
  for (year = 1900; year < 2050 && offset > 0; year++) { temp = lunarYearDays(year); offset -= temp; }
  if (offset < 0) { offset += temp; year--; }
  const leap = leapMonth(year);
  let isLeapMonth = false, month;
  for (month = 1; month < 13 && offset > 0; month++) {
    if (leap > 0 && month === leap + 1 && !isLeapMonth) { --month; isLeapMonth = true; temp = leapDays(year); }
    else temp = monthDays(year, month);
    if (isLeapMonth && month === leap + 1) isLeapMonth = false;
    offset -= temp;
  }
  if (offset === 0 && leap > 0 && month === leap + 1) {
    if (isLeapMonth) isLeapMonth = false; else { isLeapMonth = true; --month; }
  }
  if (offset < 0) { offset += temp; --month; }
  const day = offset + 1;
  return { year, month, day, isLeapMonth, monthName: (isLeapMonth ? '闰' : '') + MONTH_NAMES[month - 1], dayName: DAY_NAMES[day - 1] };
}

const SOLAR_HOLIDAYS = { '1-1': '元旦', '2-14': '情人节', '3-8': '妇女节', '5-1': '劳动节', '6-1': '儿童节', '9-10': '教师节', '10-1': '国庆节', '12-25': '圣诞节' };
const LUNAR_HOLIDAYS = { '1-1': '春节', '1-15': '元宵节', '5-5': '端午节', '7-7': '七夕', '8-15': '中秋节', '9-9': '重阳节' };

// 获取某天的节假日名称（公历节日 + 农历节日自动标注），无则返回 null
export function getHolidayLabel(date) {
  const m = date.getMonth() + 1, d = date.getDate();
  if (SOLAR_HOLIDAYS[`${m}-${d}`]) return SOLAR_HOLIDAYS[`${m}-${d}`];
  const l = solarToLunar(date);
  if (!l.isLeapMonth && LUNAR_HOLIDAYS[`${l.month}-${l.day}`]) return LUNAR_HOLIDAYS[`${l.month}-${l.day}`];
  return null;
}
