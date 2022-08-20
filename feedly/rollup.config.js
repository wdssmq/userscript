import { gm_name, gm_banner } from './src/__info.js';
import livereload from 'rollup-plugin-livereload';
import replace from '@rollup/plugin-replace';

import dev from 'rollup-plugin-dev';
import { bold, green, blue } from 'femtocolor';

const gobConfig = {
  gm_file: `${gm_name}.user.js`,
  gm_banner: gm_banner.trim() + '\n',
  log_header: blue('⚡︎dev-server'),
}

const prodConfig = {
  input: 'src/main.js',
  output: {
    file: gobConfig.gm_file,
    format: 'iife',
    banner: gobConfig.gm_banner
  },
  plugins: []
};

const devConfig = {
  input: 'src/main.js',
  output: {
    dir: 'dev',
    format: 'iife',
    // banner: gobConfig.gm_banner
  },
  plugins: [
    livereload({
      inject: false
    }),
    dev({
      port: 3000,
      host: '127.0.0.1',
      onListen(server) {
        server.log.info(gobConfig.log_header + " install script " + bold(green(`http://127.0.0.1:3000/dev/${gobConfig.gm_file}`)));

        // // 获取对象 keys
        // const keys = Object.keys(server);
        // const keys = Object.keys(this);
        // server.log.info(keys.join('\n'));
      }
    }),
  ]
};

const loaderConfig = {
  input: 'src/__dev.js',
  output: {
    file: `dev/${gobConfig.gm_file}`,
    format: 'iife',
    banner: gobConfig.gm_banner.replace(/(\/\/ @name\s+)/, "$1「dev」")
  },
  plugins: [
    replace({
      preventAssignment: true,
      // 'process.env.NODE_ENV': JSON.stringify('production'),
      // __buildDate__: () => JSON.stringify(new Date()),
      // __buildVersion: 15
      'placeholder.livereload.js': "http://localhost:35729/livereload.js?snipver=1",
      'placeholder.user.js': `http://127.0.0.1:3000/dev/main.js`,
    }),
  ]
};

const config = process.env.NODE_ENV === 'dev' ? devConfig : prodConfig;

export default [
  loaderConfig,
  config
];
