import pkg from "./package.json" assert { type: "json" };
import postcss from "rollup-plugin-postcss";

export default {
  input: "src/lib-menu.js",
  plugins: [
    postcss({
      plugins: [],
    }),
  ],
  output: [
    {
      file: pkg.main,
      format: "umd",
      name: pkg.moduleName,
      banner: "/* eslint-disable */\n",
      // sourcemap: true,
    },
  ],
};
