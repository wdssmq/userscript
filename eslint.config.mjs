// eslint.config.mjs
import antfu from "@antfu/eslint-config";

export default antfu(
  {
    stylistic: {
      indent: 2,
      quotes: "double",
    },

    ignores: [
      ".eslintrc.js",
      "packages_2308/**/*.{js,mjs,json}",
      "docs/chunks/*.mjs",
      "site-astro/src/content/gm_md/*.md",
      "packages/**/README.md",
    ],

    languageOptions: {
      globals: {
        unsafeWindow: "readonly",
        GM_getValue: "readonly",
        GM_registerMenuCommand: "readonly",
        GM_setClipboard: "readonly",
        GM_setValue: "readonly",
        GM_xmlhttpRequest: "readonly",
        GM_addStyle: "readonly",
      },
    },

    rules: {
      "style/semi": [2, "always", { omitLastInOneLineBlock: true }], // 语句强制分号结尾
      "no-alert": "off", // 允许使用 alert
      "no-console": "off", // 允许使用 console
      "no-unused-vars": "off", // 关闭原生的 no-unused-vars 规则，使用插件的版本
      "unused-imports/no-unused-vars": [
        "error",
        { vars: "all", varsIgnorePattern: "^_", args: "all", argsIgnorePattern: "^_" },
      ],
      "unused-imports/no-unused-imports": ["error", { vars: "all", varsIgnorePattern: "^_" }],
      "node/prefer-global/process": ["off"],
    },
  },

);

// 用于关闭某些规则的注释写法
// eslint no-unused-vars: "off", @typescript-eslint/no-unused-vars: "off"
// eslint no-unused-vars: "off", unused-imports/no-unused-imports: "off"
