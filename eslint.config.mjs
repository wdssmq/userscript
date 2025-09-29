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

    rules: {
      "style/semi": [2, "always", { omitLastInOneLineBlock: true }], // 语句强制分号结尾
    },
  },

);
