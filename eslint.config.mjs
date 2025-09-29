// eslint.config.mjs
import antfu from "@antfu/eslint-config";

export default antfu(
  {
    stylistic: {
      indent: 2,
      quotes: "double",
    },

    ignores: [
      "site-astro/src/content/gm_md/*.md",
      "packages_2308/**/*.{js,mjs,json}",
      ".eslintrc.js",
    ],

    rules: {
      "style/semi": [2, "always", { omitLastInOneLineBlock: true }], // 语句强制分号结尾
    },
  },

);
