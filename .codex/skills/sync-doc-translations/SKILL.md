---
name: sync-doc-translations
description: Synchronize a Parallel Docs Markdown set from one explicitly chosen Chinese, Korean, or English source file. Use after editing a zh.md, ko.md, or en.md file under web-app/docs, including the trilingual README; do not use for unrelated Markdown.
---

# Sync Document Translations

Keep one document set semantically equivalent in Chinese (`zh.md`), Korean (`ko.md`), and English (`en.md`). The user-named source file is authoritative; update the other two siblings, never the source.

## Workflow

1. Resolve the source file under `web-app/docs/<document-id>/`. Accept only `zh.md`, `ko.md`, or `en.md`. If the request does not identify exactly one source, inspect the user's stated edit or current changes; ask only when more than one candidate remains plausible.
2. From the `Multilanguage-doc-platform` root, run:

   ```powershell
   node .codex/skills/sync-doc-translations/scripts/validate-docs.mjs --root web-app/docs --source <source-path> --allow-missing-targets
   ```

   Stop on malformed source frontmatter or an invalid path. Missing target siblings may be created.
3. Read the source completely. Read existing siblings completely to retain established terminology, tone, and translated product names. Treat the source's meaning and current structure as authoritative when a sibling is stale.
4. Translate into both target languages and update only their files. Use natural technical Chinese, Korean, or English rather than word-for-word output. Do not summarize, expand, omit, or invent content.
5. Run the validator again without `--allow-missing-targets`. Fix structural errors before finishing:

   ```powershell
   node .codex/skills/sync-doc-translations/scripts/validate-docs.mjs --root web-app/docs --source <source-path>
   ```
6. Review `git diff -- <source-path> <target-paths>` and report the source, both updated targets, and validation result. Do not commit or push unless the user asks.

## Translation invariants

- Preserve heading levels and order, paragraphs, list nesting, task-list state, tables, blockquotes, link/image positions, code-fence count and language tags, and HTML comments.
- Preserve fenced code content, inline code, commands, filenames, paths, URLs, link destinations, identifiers, placeholders, and frontmatter keys exactly. Translate link labels and image alt text.
- Preserve content inside `<!-- no-translate:start -->` and `<!-- no-translate:end -->` exactly.
- Set target `lang` to its filename language. Keep `translationKey` identical across the set and equal to the document directory name.
- Translate `title` and `description`. Copy `updated` from the source to both targets so the set carries one revision date.
- Keep a named product or project term unchanged unless an existing sibling demonstrates an established translation.

The validator checks mechanical alignment, not translation quality. Always compare the completed target documents against the source for semantic completeness.
