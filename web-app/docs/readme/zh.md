---
title: Parallel Docs 使用说明
description: 本地三语 Markdown 文档工作台
lang: zh
translationKey: readme
updated: 2026-09-02
---

# Parallel Docs 使用说明

Parallel Docs 是一个只在本地运行的中、韩、英三语文档工作台。浏览器中的左右两栏显示同一个文档的两个语言版本，每一栏顶部都可以独立切换语言。

## 快速开始

需要 Node.js 22.13 或更高版本。在 `web-app` 目录运行：

```powershell
npm install
npm run dev
```

打开终端打印的本地地址，通常是 `http://localhost:3000`。使用 `Ctrl+C` 停止服务。

## 项目结构

```text
Multilanguage-doc-platform/
├─ .codex/skills/sync-doc-translations/  # 项目级同步 skill
├─ web-app/
│  ├─ app/                               # 前端界面
│  └─ docs/<document-id>/                # 三语 Markdown
│     ├─ zh.md
│     ├─ ko.md
│     └─ en.md
├─ IMPLEMENTATION_PLAN.md
├─ p4ignore.txt                         # 从父级 Perforce 排除整个项目
└─ README.md
```

每个文档目录必须包含 `zh.md`、`ko.md` 和 `en.md`。目录名就是稳定的文档 ID。

## 新增文档

1. 在 `web-app/docs` 下建立一个小写短横线命名的目录，例如 `release-process`。
2. 复制已有文档的 frontmatter，并把三个文件的 `translationKey` 设为同一个目录名。
3. 先完整写好任意一种语言，再调用同步 skill。
4. 新增目录后重启开发服务；修改现有 Markdown 时通常会自动刷新。

## 一键同步翻译

在 Codex 中明确指出刚修改的源文件，然后调用：

```text
$sync-doc-translations 以 web-app/docs/readme/zh.md 为源，同步另外两个语言版本。
```

Skill 会把指定源文件当作唯一内容依据，更新同目录下另外两种语言，并保留 Markdown 结构、代码、命令、路径、URL 和 frontmatter 键。它不是后台文件监听器；每次完成源语言修改后调用一次。

## 校验文档集

可以独立运行 skill 附带的确定性校验：

```powershell
node .codex/skills/sync-doc-translations/scripts/validate-docs.mjs --root web-app/docs
```

校验会检查三语文件是否齐全、frontmatter 是否一致，以及标题、代码块和链接目标等结构是否对齐。

## 使用界面

- 从左侧文档列表选择一个文档。
- 用每个阅读栏顶部的 toggle 选择中文、한국어 或 English。
- 使用 **Swap** 交换左右两栏的语言。
- 窄屏设备会把两个阅读栏上下排列。

## Git 与 GitHub 工作流

整个项目（包括普通 `.md` 文档）由 Git 管理并推送到 GitHub。修改后先运行 `git status` 和 `git diff`，确认三语文件同步，再提交和推送。

```powershell
git status
git diff
git add web-app/docs/readme/zh.md web-app/docs/readme/ko.md web-app/docs/readme/en.md
git commit -m "docs: update readme translations"
git push
```

项目根目录的 `p4ignore.txt` 使用 `**` 排除整个项目，避免它被外层 Perforce workspace 收集。不要将凭据或本地环境文件提交到 Git。

## 本地构建

运行 `npm run build` 验证生产构建。项目不需要数据库、登录、外部 API 或云部署；`.gitignore` 会排除 `node_modules`、`.vinext`、`.wrangler` 和 `dist` 等生成内容。
