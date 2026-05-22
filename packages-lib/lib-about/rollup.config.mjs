import { readFileSync } from "node:fs";
import path from "node:path";
import md from "@mizu/rollup-plugin-md";
import replace from "@rollup/plugin-replace";
// import pkg from "./package.json" assert {type: 'json'};
import { config } from "dotenv";
import copy from "rollup-plugin-copy";
import html from "rollup-plugin-html-string";
import livereload from "rollup-plugin-livereload";
import postcss from "rollup-plugin-postcss";
import serve from "rollup-plugin-serve";

// import resolve from "@rollup/plugin-node-resolve";

// 当前文件所在目录
const pkg = JSON.parse(readFileSync("./package.json"));

// 加载环境变量
const envConfig = config({ path: `./.env` }).parsed;

// 是否将 CSS 提取到单独文件
const extractCSS = pkg.extractCSS ? `${pkg.name}.css` : false;

const defConfig = {
  input: `src/${pkg.name}.js`,
  output: {
    file: pkg.main,
    format: "umd",
    name: pkg.moduleName,
    // banner: "/* eslint-disable */\n",
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
    html({
      include: "src/**/*.html",
    }),
    md(),
    // resolve(),
  ],
};

if (process.env.NODE_ENV === "prod") {
  // 根据 pkg.extractCSS 的值，决定是否为项目创建单独的文件夹
  const defaultDistProd = pkg.extractCSS ? `../../dist-lib/${pkg.name}` : "../../dist-lib";
  const distProd = envConfig && envConfig.DIST_COPY_PATH ? path.resolve(process.cwd(), envConfig.DIST_COPY_PATH) : defaultDistProd;

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
    serve(),
    livereload(),
  );
}

export default defConfig;
