import { NodePlopAPI } from "plop";
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
                type: 'addMany',
                destination: 'lib-{{name}}',
                templateFiles: 'lib-empty/**/*',
                base: 'lib-empty'
            },
            {
                type: 'modify',
                path: 'lib-{{name}}/package.json',
                pattern: /lib-empty/g,
                template: 'lib-{{name}}',
            }
        ],
    });
}
