// import pkg from "./package.json" assert {type: 'json'};
import { readFileSync } from "fs";
const pkg = JSON.parse(readFileSync("./package.json"));

import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";

import postcss from "rollup-plugin-postcss";

const defConfig = {
    input: `src/${pkg.name}.js`,
    plugins: [
        postcss(),
        resolve(),
        replace({
            preventAssignment: true,
            "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
        }),
    ],
    output: {
        file: pkg.main,
        format: "umd",
        name: pkg.moduleName,
        banner: "/* eslint-disable */\n",
        // sourcemap: true,
    },
};

if (process.env.NODE_ENV === "prod") {
    defConfig.output.file = `../../dist-lib/${pkg.name}.js`;
} else {
    defConfig.plugins.push(
        serve(),
        livereload("dist"),
    );
}

export default defConfig;
