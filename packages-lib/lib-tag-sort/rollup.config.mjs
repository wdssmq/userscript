import { readFileSync } from "node:fs";
import process from "node:process";
import replace from "@rollup/plugin-replace";

// import html from "rollup-plugin-html-string";
// import md from "@mizu/rollup-plugin-md";
// import pkg from "./package.json" assert {type: 'json'};
// import resolve from "@rollup/plugin-node-resolve";
// import typescript from "@rollup/plugin-typescript";

import { config } from "dotenv";
import copy from "rollup-plugin-copy";
import livereload from "rollup-plugin-livereload";
import postcss from "rollup-plugin-postcss";
import serve from "rollup-plugin-serve";
import withSolid from "rollup-preset-solid";

const pkg = JSON.parse(readFileSync("./package.json"));

// 加载环境变量
const envConfig = config({ path: `./.env` }).parsed;

// 是否将 CSS 提取到单独文件
const extractCSS = pkg.extractCSS ? `${pkg.name}.css` : false;

const defConfig = withSolid({
  input: `src/${pkg.name}.ts`,
  output: {
    file: pkg.main,
    format: "umd",
    name: pkg.moduleName,
    globals: {
      "solid-js": "solidJs",
      "solid-js/web": "solidWeb",
      "solid-js/store": "solidStore",
    },
    banner: "/* eslint-disable */\n",
    // sourcemap: true,
  },
  plugins: [
    postcss({
      extract: extractCSS,
    }),
    replace({
      "preventAssignment": true,
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    }),
    // html({
    //     include: "src/**/*.html",
    // }),
  ],
});

// withSolid 默认会将 solid-js* 设为 external，浏览器直出 UMD 时会要求页面提供全局变量。
// 这里移除对应 external，让 Solid runtime 一并打进产物，避免 web.template 运行时报错。
if (Array.isArray(defConfig.external)) {
  defConfig.external = defConfig.external.filter(item => !String(item).startsWith("solid-js"));
}

if (process.env.NODE_ENV === "prod") {
  // 根据 pkg.extractCSS 的值，决定是否为项目创建单独的文件夹
  const distProd = pkg.extractCSS ? `../../dist-lib/${pkg.name}` : "../../dist-lib";
  const targets = [
    {
      src: pkg.main,
      dest: distProd,
    },
  ];
  if (extractCSS) {
    targets.push({
      src: `dist/${pkg.name}.css`,
      dest: distProd,
    });
  }

  // 将打包好的文件复制到 distProd 目录
  defConfig.plugins.push(
    copy({
      targets,
    }),
  );
}
else {
  defConfig.plugins.push(
    serve({
      host: envConfig && envConfig.SERVE_HOST ? envConfig.SERVE_HOST : "localhost",
      port: envConfig && envConfig.SERVE_PORT ? Number.parseInt(envConfig.SERVE_PORT) : 3000,
    }),
    livereload(),
  );
}

export default defConfig;
