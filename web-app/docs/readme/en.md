---
title: Parallel Docs Guide
description: Local trilingual Markdown documentation workspace
lang: en
translationKey: readme
updated: 2026-09-02
---

# Parallel Docs Guide

Parallel Docs is a local-only workspace for Chinese, Korean, and English documentation. Two browser panels show different language versions of the same document, and the language can be switched independently at the top of each panel.

## Quick start

Node.js 22.13 or newer is required. Run these commands from `web-app`:

```powershell
npm install
npm run dev
```

Open the local address printed in the terminal, usually `http://localhost:3000`. Press `Ctrl+C` to stop the server.

## Project structure

```text
Multilanguage-doc-platform/
├─ .codex/skills/sync-doc-translations/  # Project-level sync skill
├─ web-app/
│  ├─ app/                               # Frontend interface
│  └─ docs/<document-id>/                # Trilingual Markdown
│     ├─ zh.md
│     ├─ ko.md
│     └─ en.md
├─ IMPLEMENTATION_PLAN.md
├─ p4ignore.txt                         # Exclude the project from parent Perforce
└─ README.md
```

Every document directory must contain `zh.md`, `ko.md`, and `en.md`. The directory name is the stable document ID.

## Add a document

1. Create a lowercase, hyphenated directory under `web-app/docs`, such as `release-process`.
2. Copy the frontmatter from an existing document and set `translationKey` in all three files to that directory name.
3. Finish one language version first, then invoke the synchronization skill.
4. Restart the development server after adding a directory. Edits to existing Markdown usually refresh automatically.

## Synchronize translations in one step

In Codex, explicitly name the source file you just edited and invoke:

```text
$sync-doc-translations Use web-app/docs/readme/en.md as the source and synchronize the other two language versions.
```

The skill treats the specified source as the sole content authority, updates the other two files in its directory, and preserves Markdown structure, code, commands, paths, URLs, and frontmatter keys. It is not a background file watcher; invoke it once after finishing a source-language edit.

## Validate document sets

You can run the deterministic validator bundled with the skill separately:

```powershell
node .codex/skills/sync-doc-translations/scripts/validate-docs.mjs --root web-app/docs
```

It checks that all language files exist, frontmatter agrees, and structural elements such as headings, code fences, and link destinations remain aligned.

## Use the interface

- Select a document from the list on the left.
- Use the toggle at the top of each reading panel to choose 中文, 한국어, or English.
- Use **Swap** to exchange the panel languages.
- On narrow screens, the two reading panels stack vertically.

## Git and GitHub workflow

The complete project, including its ordinary `.md` documents, is managed with Git and pushed to GitHub. After an edit, run `git status` and `git diff`, confirm the three language files are synchronized, then commit and push.

```powershell
git status
git diff
git add web-app/docs/readme/zh.md web-app/docs/readme/ko.md web-app/docs/readme/en.md
git commit -m "docs: update readme translations"
git push
```

The project-root `p4ignore.txt` uses `**` to exclude the complete project from its enclosing Perforce workspace. Do not commit credentials or local environment files to Git.

## Local build

Run `npm run build` to verify the production build. The project needs no database, login, external API, or cloud deployment; `.gitignore` excludes generated `node_modules`, `.vinext`, `.wrangler`, and `dist` content.
