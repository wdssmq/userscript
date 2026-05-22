import type { NodePlopAPI } from "plop";

export default function(plop: NodePlopAPI) {
  plop.setGenerator("new-lib", {
    prompts: [
      {
        type: "input",
        name: "name",
        message: "new lib name",
      },
    ],
    actions: [
      {
        type: "addMany",
        destination: "packages-lib/lib-{{name}}",
        templateFiles: [
          "packages-lib/lib-empty/**/*",
          "!packages-lib/lib-empty/node_modules/**",
        ],
        base: "packages-lib/lib-empty",
      },
      {
        type: "modify",
        path: "packages-lib/lib-{{name}}/package.json",
        pattern: /lib-empty/g,
        template: "lib-{{name}}",
      },
    ],
  });
}
