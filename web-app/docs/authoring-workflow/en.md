---
title: Authoring Workflow
description: From one-language draft to trilingual document set
lang: en
translationKey: authoring-workflow
updated: 2026-09-02
---

# Authoring Workflow

A clear source document is the starting point for reliable translation. Finish the content and structure in one language before synchronizing the others.

## Recommended sequence

1. Create the document directory and all three language files for a new topic.
2. Finish headings, paragraphs, lists, links, and code examples in one source file.
3. Invoke `$sync-doc-translations` and name the source file explicitly.
4. Review two language versions side by side in Parallel Docs.
5. Run the validator, then commit all three files to Git together.

## Content that stays unchanged

| Content | Example |
| --- | --- |
| Command | `npm run dev` |
| Filename | `zh.md` |
| URL | `http://localhost:3000` |
| Code block | Preserve syntax and identifiers |

> Translate link labels, but never change link destinations.

## Definition of done

All three versions should communicate the same information, use the same section order, and contain the same number of code blocks and link destinations. Write naturally for the target language instead of translating word for word.
