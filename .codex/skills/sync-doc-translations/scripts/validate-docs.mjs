#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';

const LANGUAGES = ['zh', 'ko', 'en'];
const REQUIRED_FRONTMATTER = ['title', 'description', 'lang', 'translationKey', 'updated'];

function parseArguments(argv) {
  const args = { root: 'web-app/docs', source: null, allowMissingTargets: false };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--root') args.root = argv[++index];
    else if (value === '--source') args.source = argv[++index];
    else if (value === '--allow-missing-targets') args.allowMissingTargets = true;
    else if (value === '--help') {
      console.log('Usage: validate-docs.mjs [--root web-app/docs] [--source path/to/{zh|ko|en}.md] [--allow-missing-targets]');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${value}`);
    }
  }

  if (!args.root) throw new Error('--root requires a value.');
  return args;
}

function parseMarkdown(filePath) {
  const raw = readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { raw, frontmatter: null, body: raw };

  const frontmatter = {};
  for (const line of match[1].split('\n')) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const separator = line.indexOf(':');
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^(['"])(.*)\1$/, '$2');
    frontmatter[key] = value;
  }

  return { raw, frontmatter, body: match[2] };
}

function signature(body) {
  const headings = [...body.matchAll(/^(#{1,6})\s+/gm)].map((match) => match[1].length);
  const fences = [...body.matchAll(/^```([^\s`]*)[^\n]*$/gm)].map((match) => match[1]);
  const links = [...body.matchAll(/!?\[[^\]]*\]\(([^\s)]+)(?:\s+['"][^'"]*['"])?\)/g)].map((match) => match[1]);
  const inlineCode = [...body.matchAll(/(?<!`)`([^`\n]+)`(?!`)/g)].map((match) => match[1]);
  const noTranslate = [...body.matchAll(/<!--\s*no-translate:start\s*-->([\s\S]*?)<!--\s*no-translate:end\s*-->/g)].map((match) => match[1]);
  return { headings, fences, links, inlineCode, noTranslate };
}

function sameArray(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function displayPath(path) {
  return relative(process.cwd(), path) || '.';
}

function main() {
  const args = parseArguments(process.argv.slice(2));
  const docsRoot = resolve(args.root);
  const errors = [];
  const warnings = [];

  if (!existsSync(docsRoot) || !statSync(docsRoot).isDirectory()) {
    throw new Error(`Document root is not a directory: ${docsRoot}`);
  }

  let sourcePath = null;
  let sourceDirectory = null;
  if (args.source) {
    sourcePath = resolve(args.source);
    const rel = relative(docsRoot, sourcePath);
    if (rel.startsWith(`..${sep}`) || rel === '..' || isAbsolute(rel)) {
      throw new Error(`Source must be inside ${docsRoot}`);
    }
    if (!LANGUAGES.includes(basename(sourcePath, '.md')) || !sourcePath.endsWith('.md')) {
      throw new Error('Source filename must be zh.md, ko.md, or en.md.');
    }
    if (!existsSync(sourcePath)) throw new Error(`Source file does not exist: ${sourcePath}`);
    sourceDirectory = dirname(sourcePath);
  }

  const directories = readdirSync(docsRoot)
    .map((entry) => join(docsRoot, entry))
    .filter((entry) => statSync(entry).isDirectory())
    .filter((entry) => !sourceDirectory || entry === sourceDirectory);

  if (directories.length === 0) errors.push('No document directories found.');

  for (const directory of directories) {
    const documentId = basename(directory);
    const parsed = new Map();

    for (const language of LANGUAGES) {
      const filePath = join(directory, `${language}.md`);
      if (!existsSync(filePath)) {
        const isTarget = sourcePath && filePath !== sourcePath;
        const message = `${displayPath(filePath)} is missing.`;
        if (args.allowMissingTargets && isTarget) warnings.push(message);
        else errors.push(message);
        continue;
      }

      const file = parseMarkdown(filePath);
      parsed.set(language, { ...file, filePath });
      if (!file.frontmatter) {
        errors.push(`${displayPath(filePath)} has no valid frontmatter block.`);
        continue;
      }

      for (const key of REQUIRED_FRONTMATTER) {
        if (!file.frontmatter[key]) errors.push(`${displayPath(filePath)} is missing frontmatter key: ${key}.`);
      }
      if (file.frontmatter.lang !== language) errors.push(`${displayPath(filePath)} must set lang: ${language}.`);
      if (file.frontmatter.translationKey !== documentId) errors.push(`${displayPath(filePath)} must set translationKey: ${documentId}.`);
    }

    const comparisonBase = sourcePath
      ? parsed.get(basename(sourcePath, '.md'))
      : parsed.get('en') ?? parsed.values().next().value;

    if (!comparisonBase?.frontmatter) continue;
    const baseSignature = signature(comparisonBase.body);

    for (const [language, file] of parsed) {
      if (file === comparisonBase || !file.frontmatter) continue;
      if (file.frontmatter.translationKey !== comparisonBase.frontmatter.translationKey) {
        errors.push(`${documentId}: ${language} translationKey differs from the source.`);
      }
      if (file.frontmatter.updated !== comparisonBase.frontmatter.updated) {
        errors.push(`${documentId}: ${language} updated date differs from the source.`);
      }

      const current = signature(file.body);
      for (const key of ['headings', 'fences', 'links', 'inlineCode', 'noTranslate']) {
        if (!sameArray(current[key], baseSignature[key])) {
          errors.push(`${documentId}: ${language} ${key} do not match the source structure.`);
        }
      }
    }
  }

  for (const warning of warnings) console.warn(`WARN  ${warning}`);
  for (const error of errors) console.error(`ERROR ${error}`);

  if (errors.length > 0) {
    console.error(`\nValidation failed with ${errors.length} error(s).`);
    process.exit(1);
  }

  console.log(`Validated ${directories.length} document set(s) in ${displayPath(docsRoot)}${warnings.length ? ` with ${warnings.length} warning(s)` : ''}.`);
}

try {
  main();
} catch (error) {
  console.error(`ERROR ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
