# @mizu/rollup-plugin-md

把 Markdown 文件转换为默认导出的字符串。

## 用法

```js
import md from "@mizu/rollup-plugin-md";

export default {
  plugins: [
    md({
      marked: {
        breaks: true,
      },
    }),
  ],
};

```

```js
import html from "./demo.md";

console.log(html);

```

把 `marked` 设为 `false` 时，会直接导出 Markdown 原文，不做 HTML 转换。
