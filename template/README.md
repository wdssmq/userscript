# template

独立的 Plop 配置，用于生成新的 GM 工程和 lib 模板。

## 使用

```bash
# 生成 lib 模板
pnpm --dir template run gen:lib

# 生成 GM 脚本模板
pnpm --dir template run gen:gm

```

## GM 项目使用 CSS / Sass

生成的 GM 项目已包含 `rollup.config.mjs`。在 GM 项目目录中运行以下命令，安装 CSS 打包所需依赖：

```bash
pnpm add -D postcss@catalog: rollup-plugin-postcss@catalog:

```

需要编译 Sass/SCSS 时，再运行以下命令；只使用普通 CSS 时不需要：

```bash
pnpm add -D sass@catalog:

```

在 `rollup.config.mjs` 中引入并配置 PostCSS 插件，在生产和开发配置的 `plugins` 中都加入 `postcss()`：

```js
import postcss from "rollup-plugin-postcss";

// prodConfig.plugins
plugins: [
  postcss(),
],

// devConfig.plugins
plugins: [
  postcss(),
  // 保留现有的开发插件
],

```

之后从入口文件导入样式，例如 `import "./style.css";`；使用 Sass 时导入 `.scss` 文件，并确保已添加 `sass` 依赖。
