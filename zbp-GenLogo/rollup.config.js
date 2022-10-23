import { gm_name, gm_banner } from "./src/__info.js";
export default [
  {
    input: "src/main.js",
    output: {
      name: gm_name,
      file: `${gm_name}.user.js`,
      format: "iife",
      banner: gm_banner.trim(),
    },
    plugins: [],
  },
];
