# 心事 · Heartnote

> 心事，心中所想之事。一款面向情侣与个人的**纪念日 + 手账**轻量 Web 应用：界面极简，全流程中英双语。
> *Heartnote — what's on your mind.* A minimalist bilingual (中文 / English) app for anniversaries and daily journaling.

🔗 **在线体验 / Live demo：** <https://gentle-doodle-days.nocode.host>

<!-- 截图建议放在 docs/ 目录，例如：![首页](docs/home.png) -->

---

## 为什么做这个

市面上的纪念日 App 大多只关注"每年一次"的日子，但情侣之间常见的是**月度纪念日**（每月 20 号），日常生活里也有**每月还款、每月交租**这类按月重复的事情。另外，七夕、中秋这些节日按农历走，只用公历的应用往往不显示。

这个项目想解决的就是这几件小事：**把"每年 / 每月 / 单次"三种重复分清楚，把农历和传统节日显示出来，界面尽量简单，中英文用户都能用。**

## 核心功能

| 模块 | 说明 |
| --- | --- |
| 📖 手账 | 富文本编辑（加粗、斜体等），记录心情 emoji 与标签；历史回顾页按时间浏览 |
| 🎈 重要日子 | 纪念日 / 约会 / 日常三类；同时显示"还有几天"和"已经过去几天"；支持置顶 |
| 🔁 重复规则 | 单次 / 每年 / 每月，按事件类型只展示合理的选项；倒计时始终指向**下一次**实际发生的日期 |
| 🗓️ 月度重要日 | 专门的按月重复管理页：31 号遇到小月自动取月末；输入当月不存在的日期（如 2 月 30 日）时弹窗拦截并禁用提交 |
| 🌙 农历与节日 | 日历悬浮显示干支年 + 农历日期；春节、端午、七夕、中秋等农历节日与公历节日自动标注 |
| 🎁 预置节日 | 情人节、七夕（按农历七月初七逐年换算）、母亲节（5 月第 2 个周日）、父亲节（6 月第 3 个周日）；可隐藏、可一键恢复 |
| 📅 智能日历 | 月视图；可拖拽或点选移动事件；按类型 / 置顶 / 标签筛选；点击日期联动显示当天手账 |
| 🔐 账号中心 | 邮箱 + 密码注册（密码强度实时检测、两次输入校验）、密码登录、邮箱验证码登录、验证码找回密码；错误提示分级，登录失败统一提示，不暴露账号是否存在；每个账号只能读写自己的数据 |
| 🌐 中英双语 | 所有页面、按钮、提示、弹窗都可一键切换中英文 |
| 📊 统计 | 心情分布、近 7 天趋势；基于关键词词频的本地统计摘要（不调用大模型） |

## 一些设计细节

- **日期边界：** 按月重复时，31 号在 30 天的月份自动取 30 号、在 2 月取 28 / 29 号；按年重复的 2 月 29 日在平年取 2 月 28 日。
- **时区安全：** `yyyy-MM-dd` 格式的日期一律按本地时区解析，避免被当成 UTC 导致日期差一天。
- **删除可选：** 删除时可以选择"归档（可找回）"或"彻底删除"，并有二次确认。
- **数据兜底：** 云端读写失败时自动使用浏览器本地备份，内容不会因为网络问题丢失。
- **输入健壮：** 编辑器会检测文字方向（中文 / 英文 / 阿拉伯文、希伯来文等从右往左的文字），并清除会导致排版错乱的隐形控制字符，同时保留 emoji 组合字符；附带一组测试用例（`src/lib/textDirectionTests.js`）。
- **新手引导与反馈：** 首次访问有引导浮层；提供意见反馈表单（实时校验）；页面埋点记录 PV、点击、停留时长，用于后续迭代。
- **数据隔离：** 在数据库层开启行级安全（RLS）：手账与重要日子按 `user_id = auth.uid()` 限定只有本人可读写，未登录用户无任何权限；反馈、埋点、日志表只允许写入、不允许读取（见 `src/supabase/migrations/`）。
- **技术取舍：** 独立数据库实例、Redis 会话缓存、API 限流、短信 / 生物识别登录等需要自建后端，超出纯前端项目的范围，因此没有实现；会话管理与验证码交给 Supabase Auth。

## 开发方式：AI 辅助网页设计

本项目在美团 NoCode 平台上完成：

1. **我负责产品：** 需求构思、功能取舍、交互和界面风格，都由我自己决定；
2. **AI 负责实现：** 用自然语言描述需求，由 NoCode 生成 React 代码；
3. **我负责验收：** 逐页手动测试，发现问题后描述复现场景，让 AI 修改，反复迭代直到满意。

这个仓库保存的是 NoCode 导出的源码，只额外做了一处改动：数据库连接信息改为从环境变量读取。

## 技术栈

React 18 · Vite 5 · Tailwind CSS · shadcn/ui（Radix UI） · TanStack Query · Supabase（数据库 + Auth） · date-fns · Recharts · Framer Motion

## 本地运行

需要 Node.js 18（见 `.nvmrc`）和一个 Supabase 项目。

```bash
cp .env.example .env   # 填入你自己的 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY
yarn install           # 或 npm install
npm run dev            # 默认 http://localhost:8080
```

建表脚本在 `src/supabase/migrations/`。

## 目录结构

```
src/
├── pages/          # 今日记录、历史回顾、重要日记录、月度重要日、智能日历、账号中心、设置
├── components/     # 按页面分组的组件；ui/ 为 shadcn/ui 基础组件
├── hooks/          # 数据读写（云端 + 本地备份）、登录状态、语言等
├── lib/            # 日期规则、农历换算、多语言词典、认证错误映射、文字方向检测等纯函数
└── supabase/       # 数据库迁移脚本
```

## 已知限制

- 演示站仅供体验，请不要填写真实的隐私内容。

---

## English

**Heartnote** (心事, "what's on your mind") is a minimalist anniversary tracker and journal for couples and individuals. It is fully bilingual in Chinese and English.

- **Repeat rules:** events can be one-time, yearly or monthly, so month-anniversaries and monthly bills are covered. Countdowns always point to the next occurrence. Day 31 falls back to the last day of shorter months, and invalid dates are blocked.
- **Lunar calendar:** shows lunar dates and marks traditional festivals. Qixi is converted from the lunar calendar every year.
- **Accounts:** email sign-up with a live password-strength meter, password or one-time-code login, and code-based password reset. Error messages are graded, and login failures never reveal whether an account exists. Row-level security in the database means each user can only read and write their own data.
- **Calendar view:** move events by drag-and-drop, filter by type, pin or tag, and see linked journal entries.
- **Reliability:** a browser-side backup is used when the cloud is unavailable. Deleting offers a choice between archiving (recoverable) and permanent deletion.

**How it was built.** I designed the product: requirements, features, interaction and visual style. It was implemented through natural-language conversations on Meituan's NoCode AI platform, and I tested and iterated on it page by page.
