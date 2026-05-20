# lib-about

用于在后台页面注入「关于」按钮，并在点击或自动触发时替换主内容区。

## 特性

- UMD 全局对象：`mzAbout`
- 纯原生 DOM，不依赖 jQuery
- 替换内容来自 HTML 模板文件（`src/base/about.html`）
- 支持状态机：`reject -> continue -> pass`

## 使用

```html
<script src="dist/lib-about.js"></script>
<script>
	mzAbout.init({
		appId: "FileIgnore",
		autoTrigger: true,
		menuSelector: ".SubMenu",
		mainSelector: "#divMain2"
	});
</script>
```

## API

- `init(options)` 初始化并注入按钮
- `check()` 检查当前 appId 是否已通过
- `show()` 强制替换主内容区
- `toggle()` 触发两段确认和显示切换
- `reset()` 清除当前 appId 的通过状态

## 构建

```bash
npm run build
```

### 自定义复制目录（.env）

在项目根目录创建 `.env`，配置 `DIST_COPY_PATH`：

```env
DIST_COPY_PATH=../../../2025-07-zbp/plugin/FileIgnore/about
```

说明：

- 构建命令仍然使用 `npm run build`
- `DIST_COPY_PATH` 支持相对路径（基于当前库根目录）或绝对路径
- 未设置时，保持默认复制目录 `../../dist-lib`（`extractCSS=true` 时为 `../../dist-lib/lib-about`）
