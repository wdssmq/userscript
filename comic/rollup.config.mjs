import { gm_name, gm_banner, gm_require } from "./src/__info.js";
import replace from "@rollup/plugin-replace";

// for prod
import monkey from "rollup-plugin-monkey";

// console.log("typeof monkey：", typeof monkey);
// // typeof monkey： function

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
