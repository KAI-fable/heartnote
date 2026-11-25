// 标签显示名解析：默认标签（isDefault）随语言偏好翻译（预置中英双名）；
// 用户手动创建的自定义标签始终保留原名称/原语言，不受语言切换影响
// pref: 'auto'（跟随界面语言）| 'zh' | 'en'，来自设置页「默认标签语言」偏好
export function tagDisplayName(tag, lang = 'zh', pref = 'auto') {
  if (!tag) return '';
  const effective = pref === 'auto' ? lang : pref;
  if (tag.isDefault && effective === 'en' && tag.nameEn) return tag.nameEn;
  return tag.name;
}
