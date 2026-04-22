// import pkg from "./package.json" assert {type: 'json'};
import { readFileSync } from "node:fs";

import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import html from "rollup-plugin-html-string";
import livereload from "rollup-plugin-livereload";

import md from "rollup-plugin-md";
import postcss from "rollup-plugin-postcss";
import serve from "rollup-plugin-serve";

const pkg = JSON.parse(readFileSync("./package.json"));

const defConfig = {
  input: `src/${pkg.name}.js`,
  plugins: [
    postcss(),
    resolve(),
    replace({
      "preventAssignment": true,
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    }),
    md(),
    html({
      include: "src/**/*.html",
    }),
  ],
  output: {
    file: pkg.main,
    format: "umd",
    name: pkg.moduleName,
    // banner: "/* eslint-disable */\n",
    // sourcemap: true,
  },
};

if (process.env.NODE_ENV === "prod") {
  defConfig.output.file = `../../dist-lib/${pkg.name}.js`;
}
else {
  defConfig.plugins.push(
    serve(),
    livereload("dist"),
  );
}

export default defConfig;
