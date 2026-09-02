# Multilanguage Documentation Platform — Implementation Plan

## Goal

Build a local-first web application for maintaining one documentation set in Chinese, Korean, and English. The application compares two language versions side by side, while a project-level Codex skill synchronizes the other two Markdown files after one language file changes.

## Product decisions

- Use a local React/TypeScript site with no hosted service or database.
- Store content as ordinary Markdown files under `docs/` and version the complete project with Git and GitHub.
- Identify translations by a shared document folder and fixed filenames: `zh.md`, `ko.md`, and `en.md`.
- Read Markdown through a small local Node API so edits on disk appear in the browser without bundling content into the application.
- Keep translation synchronization agent-driven: the project-level skill compares the three files, treats the explicitly named edited language as the source of truth, preserves Markdown structure, and updates only the other two language files.
- Treat code blocks, URLs, paths, commands, identifiers, frontmatter keys, and explicit “do not translate” spans as protected content.

## Delivery phases

1. Scaffold the local web project and establish an intentional documentation-workbench visual system.
2. Add the document discovery/read API and a sample trilingual document.
3. Build the split comparison interface with independent language toggles, document navigation, responsive behavior, and empty/error/loading states.
4. Add the project-level `sync-doc-translations` skill with deterministic validation helpers and project conventions.
5. Write one trilingual README whose three source files follow the same synchronization convention.
6. Run the skill validator, Markdown/content checks, application tests, production build, and a local HTTP smoke test.
7. Initialize a Git repository, publish it to GitHub, and exclude the project from its enclosing Perforce workspace.

## Repository layout

The workspace root contains the plan, trilingual README entrypoint, and project-level Codex skill. The generated frontend lives in `web-app/`; its Markdown library lives in `web-app/docs/`. This keeps the project skill discoverable from the parent workspace while keeping Node dependencies isolated inside the frontend package.

## Acceptance criteria

- `npm run dev` starts a local server and prints a browser URL.
- The first screen shows the same document in two panes.
- Each pane can independently switch among 中文 / 한국어 / English; choosing the same language on both sides is prevented or handled clearly.
- Adding a folder containing `zh.md`, `ko.md`, and `en.md` makes a document discoverable without changing frontend source.
- The project skill documents a one-command/invocation workflow for synchronizing from any one source language and validates that all language siblings exist.
- README content is available in all three languages and explains setup, document authoring, translation sync, local preview, and Git/GitHub usage.
- No cloud deployment or hosted persistence is introduced.

## Version-control boundary

This project has its own Git repository and GitHub remote. A project-root `p4ignore.txt` ignores the complete directory because the surrounding workspace uses `P4IGNORE=p4ignore.txt`; no project file should be added to Perforce.
