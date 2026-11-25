import { detectDirection, containsBiDiMarks, stripBiDiMarks, sanitizeInput } from './textDirection';

// 辅助断言
function eq(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

// BiDi 方向检测 / 隐形标记清洗 / emoji 兼容 / 输入法场景 单元测试集
export function runDirectionTests() {
  const tests = [
    {
      name: '纯英文检测为 LTR',
      run: () => eq(detectDirection('Hello World'), 'ltr'),
    },
    {
      name: '纯阿拉伯文检测为 RTL',
      run: () => eq(detectDirection('مرحبا بالعالم'), 'rtl'),
    },
    {
      name: '纯希伯来文检测为 RTL',
      run: () => eq(detectDirection('שלום עולם'), 'rtl'),
    },
    {
      name: '纯中文检测为 neutral',
      run: () => eq(detectDirection('你好世界'), 'neutral'),
    },
    {
      name: '纯 emoji 检测为 neutral',
      run: () => eq(detectDirection('🌟🎉📚'), 'neutral'),
    },
    {
      name: '空字符串检测为 neutral',
      run: () => eq(detectDirection(''), 'neutral'),
    },
    {
      name: '中英混合（英文占多）检测为 LTR',
      run: () => eq(detectDirection('Hello 你好 World 世界'), 'ltr'),
    },
    {
      name: '阿拉伯文与英文混合（RTL 占多）检测为 RTL',
      run: () => eq(detectDirection('مرحبا Hello مرحبا العالم'), 'rtl'),
    },
    {
      name: '英文与阿拉伯文混合（LTR 占多）检测为 LTR',
      run: () => eq(detectDirection('Hello مرحبا World مرحبا Hello'), 'ltr'),
    },
    {
      name: '检测包含 LRM 隐形标记',
      run: () => containsBiDiMarks('Hello\u200EWorld') === true,
    },
    {
      name: '检测包含 RLM 隐形标记',
      run: () => containsBiDiMarks('Hello\u200FWorld') === true,
    },
    {
      name: '检测不包含隐形标记返回 false',
      run: () => containsBiDiMarks('Hello World') === false,
    },
    {
      name: '剥离 LRM 标记',
      run: () => eq(stripBiDiMarks('Hello\u200EWorld'), 'HelloWorld'),
    },
    {
      name: '剥离 RLM 标记',
      run: () => eq(stripBiDiMarks('Hello\u200FWorld'), 'HelloWorld'),
    },
    {
      name: '剥离 LRE/RLE/PDF 标记',
      run: () => eq(stripBiDiMarks('\u202AHello\u202CWorld'), 'HelloWorld'),
    },
    {
      name: '剥离 LRI/RLI/FSI/PDI 标记',
      run: () => eq(stripBiDiMarks('\u2066Hello\u2069World'), 'HelloWorld'),
    },
    {
      name: '剥离多个混合隐形标记',
      run: () => eq(stripBiDiMarks('\u200EHi\u200F\u202A\u202C'), 'Hi'),
    },
    {
      name: 'ZWJ emoji 保真（家庭 emoji 不被拆散）',
      run: () => eq(stripBiDiMarks('👨\u200D👩\u200D👧'), '👨\u200D👩\u200D👧'),
    },
    {
      name: 'ZWJ emoji + 隐形标记混合清洗',
      run: () => eq(stripBiDiMarks('\u200E👨\u200D👩\u200D👧\u200F'), '👨\u200D👩\u200D👧'),
    },
    {
      name: 'sanitizeInput 清除隐形标记保留正常文本',
      run: () => eq(sanitizeInput('Hello\u200E World\u200F'), 'Hello World'),
    },
    {
      name: 'sanitizeInput 保留 ZWJ emoji',
      run: () => eq(sanitizeInput('👨\u200D👩\u200D👦'), '👨\u200D👩\u200D👦'),
    },
    {
      name: '中性输入（中文+数字）检测回落 neutral',
      run: () => eq(detectDirection('今天 2024 年 10 月 1 日'), 'neutral'),
    },
    {
      name: '中性输入（emoji+中文）检测回落 neutral',
      run: () => eq(detectDirection('🌟 今天心情不错 😊'), 'neutral'),
    },
    {
      name: '拼音组合中间态字符串检测为 LTR',
      run: () => eq(detectDirection('nihao'), 'ltr'),
    },
    {
      name: '中文+未上屏拼音混合检测为 LTR（组合期不误判 RTL）',
      run: () => eq(detectDirection('你好nihao'), 'ltr'),
    },
    {
      name: '五笔字根码字符串检测为 LTR',
      run: () => eq(detectDirection('wqvb'), 'ltr'),
    },
    {
      name: '拼音串携带隐形标记：清洗保留全部字母',
      run: () => eq(sanitizeInput('ren\u200Emin'), 'renmin'),
    },
    {
      name: '五笔码+隐形标记混合清洗不损伤编码',
      run: () => eq(sanitizeInput('\u202Awqvb\u202C'), 'wqvb'),
    },
    {
      name: '上屏后纯中文输入流检测回落 neutral（无字母残留）',
      run: () => eq(detectDirection('你好世界'), 'neutral'),
    },
    {
      name: '连续多轮组合后中文+emoji 检测回落 neutral',
      run: () => eq(detectDirection('今天真开心😊🎉'), 'neutral'),
    },
  ];

  return tests.map((t) => {
    try {
      const pass = t.run();
      return { name: t.name, pass, err: pass ? null : '断言未通过' };
    } catch (e) {
      return { name: t.name, pass: false, err: e?.message || String(e) };
    }
  });
}
