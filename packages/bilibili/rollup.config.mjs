import { gm_name, gm_banner, gm_require } from "./src/__info.js";
import replace from "@rollup/plugin-replace";
import open from "open";

// for prod
import monkey, { monkeyPath, monkeyRequire } from "rollup-plugin-monkey";

// console.log("typeof monkey：", typeof monkey);
// // typeof monkey： function

// // process.env.PWD 中获取当前文件夹名
// const gm_dirname = process.env.PWD.split("/").pop();
// console.log("gm_dirname：", gm_dirname);

const gobConfig = {
  gm_file: `${gm_name}.user.js`,
  gm_banner: gm_banner.trim() + "\n",
  gm_version: process.env.npm_package_version,
  gm_dev: monkeyPath.devJS,
  ...monkeyRequire(gm_require),
  listen: {
    host: "localhost",
    port: "3000",
  },
  url: null,
};

gobConfig.url = `http://${gobConfig.listen.host}:${gobConfig.listen.port}`;
gobConfig.gm_banner = gobConfig.gm_banner.replace("placeholder.pkg.version", gobConfig.gm_version);
if (gm_require.length > 0) {
  gobConfig.gm_banner = gobConfig.gm_banner.replace("// ==/", gobConfig.gm_require + "\n// ==/");
}

if (process.env.NODE_ENV === "prod") {
  gobConfig.gm_file = `../../dist/${gm_name}.user.js`;
}

const prodConfig = {
  input: "src/main.js",
  output: {
    file: gobConfig.gm_file,
    format: "iife",
    banner: gobConfig.gm_banner,
  },
  plugins: [],
};

const devConfig = {
  input: "src/main.js",
  output: {
    dir: "dev",
    format: "iife",
    // banner: gobConfig.gm_banner
    banner: "/* eslint-disable */\n",
  },
  plugins: [
    monkey({
      listen: gobConfig.listen,
      onListen(web) {
        web.server.log.info({
          "msg": "{{header}} install script for dev {{url}}",
          "url": `${gobConfig.url}/dev/${gobConfig.gm_file}`,
        });
        web.server.log.info({
          "msg": "{{header}} install script for prod {{url}}",
          "url": `${gobConfig.url}/${gobConfig.gm_file}`,
        });
        open(`${gobConfig.url}/dev/${gobConfig.gm_file}`);
      },
    }),
  ],
};

const loaderConfig = {
  input: gobConfig.gm_dev,
  output: {
    file: `dev/${gobConfig.gm_file}`,
    format: "iife",
    banner: gobConfig.gm_banner.replace(/(\/\/ @name\s+)/, "$1「dev」"),
  },
  plugins: [
    replace({
      preventAssignment: true,
      "placeholder.livereload.js": `${gobConfig.url}/livereload.js?snipver=1`,
      "placeholder.user.js": `${gobConfig.url}/dev/main.js`,
      "placeholder.gm_api": gobConfig.gm_api,
    }),
  ],
};

const rollupConfig = [prodConfig];

if (process.env.NODE_ENV === "dev") {
  rollupConfig.push(loaderConfig);
  rollupConfig.push(devConfig);
}

export default rollupConfig;
