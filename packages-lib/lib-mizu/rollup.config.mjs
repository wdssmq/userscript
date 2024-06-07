// import pkg from "./package.json" assert {type: 'json'};
import { readFileSync } from "fs";
const pkg = JSON.parse(readFileSync("./package.json"));

import livereload from "rollup-plugin-livereload";
import postcss from "rollup-plugin-postcss";
import serve from "rollup-plugin-serve";
import copy from "rollup-plugin-copy";

// import html from "rollup-plugin-html-string";
// import md from "rollup-plugin-md";
// import resolve from "@rollup/plugin-node-resolve";

import replace from "@rollup/plugin-replace";

// 是否将 CSS 提取到单独文件
// const extractCSS = pkg.extractCSS ? `${pkg.name}.css` : false;
const extractCSS = "mizu.css";

const defConfig = {
    input: `src/${pkg.name}.js`,
    output: {
        // file: pkg.main,
        file: "/home/wdssmq/Git/2024-05-zbp/plugin/mz_SingleList/mizu-ui/mizu.js",
        format: "umd",
        name: pkg.moduleName,
        banner: "/* eslint-disable */\n",
        // sourcemap: true,
    },
    plugins: [
        postcss({
            extract: extractCSS,
        }),
        replace({
            preventAssignment: true,
            "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
        }),
        // resolve(),
        // md(),
        // html({
        //     include: "src/**/*.html",
        // }),
    ],
};

if (process.env.NODE_ENV === "prod") {
    // 根据 pkg.extractCSS 的值，决定是否为项目创建单独的文件夹
    const distProd = pkg.extractCSS ? `../../dist-lib/${pkg.name}` : "../../dist-lib";
    // 将打包好的文件复制到 distProd 目录
    defConfig.plugins.push(
        copy({
            targets: [
                {
                    src: pkg.main,
                    dest: distProd,
                },
                {
                    src: `dist/${pkg.name}.css`,
                    dest: distProd,
                },

            ],
        }),
    );
} else {
    defConfig.plugins.push(
        // serve(),
        // livereload(),
        // copy({
        //     targets: [
        //         {
        //             src: `dist/${pkg.name}.css`,
        //             dest: "/home/wdssmq/Git/2024-05-zbp/plugin/mz_SingleList/mizu-ui",
        //             rename: "mizu.css",
        //         },
        //     ],
        // }),
    );
}

export default defConfig;
