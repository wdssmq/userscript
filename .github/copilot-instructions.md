# 用户脚本仓库指引

以下指引仅适用于 `userscript` 仓库。

## 项目结构

- 这是 pnpm 工作区；子项目位于 `packages/`、`packages-lib/` 和 `packages-plugin/`，具体配置见根目录的 `pnpm-workspace.yaml`。
- 各子项目使用自己的 `package.json` 定义构建和检查命令；修改时先确认目标子项目的配置。
- 公共 ESLint 配置位于根目录的 `eslint.config.mjs`；JavaScript 和 TypeScript 代码遵循该配置及目标子项目的现有写法。

## 验证

- 优先在受影响的子项目执行相关测试、构建或 lint，避免不必要地运行整个工作区的任务。
- 构建可能生成或更新脚本文件；先检查目标子项目的构建配置和工作区状态，保留已有未提交修改。
- 子项目的 README 由工作流自动生成，不需要你修改。
- build 测试后，恢复 dist 或 dist-lib，之后会以单独提交的方式更新。
