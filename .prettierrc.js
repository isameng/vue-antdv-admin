module.exports = {
    printWidth: 120, // 换行字符串阈值
    tabWidth: 2, // 使用 2 个空格缩进
    useTabs: false, // 不使用缩进符，而使用空格
    semi: true, // 句末加分号
    singleQuote: false, // 用单引号
    trailingComma: "none", // 最后一个对象元素加逗号
    bracketSpacing: true, // 大括号内的首尾需要空格
    arrowParens: "avoid", // (x) => {} 是否要有小括号
    proseWrap: "preserve", // 使用默认的折行标准
    //   "css" - 遵守CSS显示属性的默认值
    // "strict" - 空格被认为是敏感的
    // "ignore" - 空格被认为是不敏感的
    htmlWhitespaceSensitivity: "ignore",
    endOfLine: "lf", // 换行符使用 lf
    quoteProps: "as-needed", // 对象的 key 仅在必要时用引号
    jsxSingleQuote: false, // jsx 不使用单引号，而使用双引号
    jsxBracketSameLine: false // jsx 标签的反尖括号需要换行
  };
  