// 事件类型与颜色标签配置（约会 / 纪念日 / 日常）
export const EVENT_TYPES = [
  { name: '约会', emoji: '💌', chip: 'bg-pink-200 text-pink-700 border-pink-300', dot: 'bg-pink-400' },
  { name: '纪念日', emoji: '🎈', chip: 'bg-rose-200 text-rose-700 border-rose-300', dot: 'bg-rose-500' },
  { name: '日常', emoji: '🌿', chip: 'bg-sky-200 text-sky-700 border-sky-300', dot: 'bg-sky-400' },
];

// 根据类型名取配置，未知类型默认按"日常"处理
export const typeOf = (name) => EVENT_TYPES.find((t) => t.name === name) || EVENT_TYPES[2];

// 标签分类：自定义标签必须归属一个分类，颜色随分类统一，保证手账与重要日子归类一致
export const TAG_CATEGORIES = [
  { name: '生活', chip: 'bg-emerald-200 text-emerald-700' },
  { name: '心情', chip: 'bg-pink-200 text-pink-700' },
  { name: '工作', chip: 'bg-sky-200 text-sky-700' },
  { name: '节日', chip: 'bg-amber-200 text-amber-700' },
];

// 根据分类名取配色，未知分类默认按"生活"处理
export const categoryOf = (name) => TAG_CATEGORIES.find((c) => c.name === name) || TAG_CATEGORIES[0];

// 标签自定义颜色盘与图标盘：标签支持个性化颜色/图标配置
export const TAG_COLORS = ['#fbbf24', '#fb7185', '#60a5fa', '#34d399', '#a78bfa', '#f97316'];
export const TAG_ICONS = ['🌷', '🍔', '✈️', '💼', '🏃', '📝', '🎉', '❤️', '⭐', '🌿'];
