import { createFilter } from "@rollup/pluginutils";
import { marked } from "marked";

const ext = /\.md$/i;

export default function md(options = {}) {
  const filter = createFilter(options.include || ["**/*.md"], options.exclude);

  if (options.marked && typeof options.marked === "object") {
    marked.setOptions(options.marked);
  }

  return {
    name: "md",

    transform(source, id) {
      if (!ext.test(id) || !filter(id)) {
        return null;
      }

      const data = options.marked === false ? source : marked.parse(source);

      return {
        code: `export default ${JSON.stringify(String(data))};`,
        map: { mappings: "" },
      };
    },
  };
}
