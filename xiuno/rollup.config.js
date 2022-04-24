import { name, banner } from './src/__info.js';
export default [
  {
    input: 'src/main.js',
    output: {
      name: name,
      file: `${name}.user.js`,
      format: 'iife',
      banner: banner
    },
    plugins: []
  },
];
