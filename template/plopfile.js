/** @type {import('plop').NodePlopAPI} */
const path = require("node:path");

const templateRoot = __dirname;
const repoRoot = path.resolve(templateRoot, "..");
const packagesDir = path.resolve(repoRoot, "packages");
const packagesLibDir = path.resolve(repoRoot, "packages-lib");

module.exports = function(plop) {
  plop.setHelper("mustacheL", () => "{{");
  plop.setHelper("mustacheR", () => "}}");
  plop.setHelper("gmMatchLines", (match) => {
    const values = String(match || "")
      .split(/[\n,]/)
      .map(item => item.trim())
      .filter(Boolean);

    const uniqueValues = [...new Set(values)];
    if (uniqueValues.length === 0) {
      return "http://localhost:3000/*";
    }

    return uniqueValues.join("\n// @match        ");
  });

  plop.setGenerator("new-lib", {
    description: "Create a new lib based on lib-empty template",
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
        destination: `${packagesLibDir}/lib-{{name}}`,
        templateFiles: [
          `${path.resolve(templateRoot, "lib-empty")}/**/*`,
          `!${path.resolve(templateRoot, "lib-empty")}/**/node_modules/**`,
        ],
        base: path.resolve(templateRoot, "lib-empty"),
      },
      {
        type: "modify",
        path: `${packagesLibDir}/lib-{{name}}/package.json`,
        pattern: /lib-empty/g,
        template: "lib-{{name}}",
      },
    ],
  });

  plop.setGenerator("new-gm", {
    description: "Create a gm project based on gm-base template",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "project name (kebab-case)",
        validate(input) {
          if (!input || !input.trim()) {
            return "project name is required";
          }
          if (!/^[a-z0-9][a-z0-9-]*$/.test(input)) {
            return "use kebab-case: letters, numbers, and dash only";
          }
          return true;
        },
      },
      {
        type: "input",
        name: "description",
        message: "userscript description",
        default: "try to take over the world!",
      },
      {
        type: "input",
        name: "match",
        message: "@match URL pattern, comma/newline supported",
        default: "http://localhost:3000/*",
      },
      {
        type: "input",
        name: "namespace",
        message: "@namespace",
        default: "https://www.wdssmq.com/",
      },
    ],
    actions: [
      {
        type: "addMany",
        destination: `${packagesDir}/{{name}}`,
        templateFiles: [
          `${path.resolve(templateRoot, "gm-base")}/**/*`,
          `!${path.resolve(templateRoot, "gm-base")}/**/node_modules/**`,
        ],
        base: path.resolve(templateRoot, "gm-base"),
        force: true,
      },
      {
        type: "modify",
        path: `${packagesDir}/{{name}}/src/__info.js`,
        pattern: /__GM_NAME__/g,
        template: "{{name}}",
      },
      {
        type: "modify",
        path: `${packagesDir}/{{name}}/src/__info.js`,
        pattern: /__GM_DESCRIPTION__/g,
        template: "{{description}}",
      },
      {
        type: "modify",
        path: `${packagesDir}/{{name}}/src/__info.js`,
        pattern: /\/\/ @match\s+__GM_MATCH__/g,
        template: "// @match        {{{gmMatchLines match}}}",
      },
      {
        type: "modify",
        path: `${packagesDir}/{{name}}/src/__info.js`,
        pattern: /__GM_NAMESPACE__/g,
        template: "{{namespace}}",
      },
    ],
  });
};
