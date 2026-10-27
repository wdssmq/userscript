# 提交信息

AI 生成 Git 提交信息时，主题必须使用以下格式：

```text
<type>(<scope>): <summary>
```

根据实际改动选择最合适的类型；摘要简洁描述改动，优先使用中文。不要使用列表之外的前缀，也不要省略类型前缀。

· `<type>` 取值

`feat`、`fix`、`docs`、`style`、`refactor`、`build`、`chore`；

· `<scope>` 取值

用于指定改动的范围，通常为修改的模块或文件所在的目录名。

- 对于 `packages/` 或 `packages-lib/` 的子项目，`<scope>`为子项目的目录名；
- 其他`<scope>`路径：
  - /template —— 使用目录名
  - /site-astro —— 使用目录名
  - /bin 或 /main.py —— `python`
- 不符合以上规则的，使用 `misc` 或省略 `<scope>`。
