import { gm_name, gm_banner } from "./src/__info.js";
import replace from "@rollup/plugin-replace";
// import monkey from '#monkey'

import monkey from "rollup-plugin-monkey";

/*
pnpm i https://github.com/wdssmq/rollup-plugin-monkey#v1
*/

const gobConfig = {
  gm_file: `${gm_name}.user.js`,
  gm_banner: gm_banner.trim() + "\n",
  listen: {
    host: "localhost",
    port: "3000",
  },
  url: null,
};

gobConfig.url = `http://${gobConfig.listen.host}:${gobConfig.listen.port}`;

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
          "msg": "{{header}} install script {{url}}",
          "url": `${gobConfig.url}/dev/${gobConfig.gm_file}`,
        });
      },
    }),
  ],
};

const loaderConfig = {
  input: "src/__dev.js",
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
    }),
  ],
};

const config = process.env.NODE_ENV === "dev" ? devConfig : prodConfig;

export default [
  loaderConfig,
  config,
];
