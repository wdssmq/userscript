module.exports = {
  "root": true,
  "env": {
    "node": true,
    "browser": true,
    "es2021": true,
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
  },
  "globals": {
    "GM_addStyle": "readonly",
    "GM_getValue": "readonly",
    "GM_setValue": "readonly",
    "GM_setClipboard": "readonly",
    "GM_xmlhttpRequest": "readonly",
    "GM_registerMenuCommand": "readonly",
    "unsafeWindow": "readonly",
    "$": "readonly",
  },
  "rules": {
    "generator-star-spacing": 0, // generator 函数中 * 号前后的空格
    "no-unused-vars": [0, { "args": "none" }], // 变量声明后未使用
    // ------------------------------
    "comma-dangle": [1, "always-multiline"], // 对象或数组的拖尾逗号
    "arrow-parens": [1, "as-needed", { "requireForBlockBody": true }], // 箭头函数参数括号
    // 函数圆括号之前的空格要求
    "space-before-function-paren": [
      1,
      {
        "named": "never",
        // ↓ 预想是设置为 never，但是 VSCode 总是给加上 (╯﹏╰）
        "anonymous": "never",
      },
    ],
    // ------------------------------
    "semi": [2, "always", { "omitLastInOneLineBlock": true }], // 语句强制分号结尾
    "quotes": [2, "double"], // 引号类型
    "spaced-comment": [2, "always"], // 注释前后的空格
    "no-irregular-whitespace": [2, { "skipStrings": true, "skipRegExps": true }], // 禁止不规则的空白
  },
};
