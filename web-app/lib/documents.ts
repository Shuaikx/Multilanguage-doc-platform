export const languages = ['zh', 'ko', 'en'] as const;

export type Language = (typeof languages)[number];
export type LanguageMap<T> = Record<Language, T>;

export interface DocumentVersion {
  title: string;
  description: string;
  updated: string;
  content: string;
}

export interface DocumentSet {
  id: string;
  versions: LanguageMap<DocumentVersion>;
}

const sourceFiles = import.meta.glob('../docs/*/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const languageNames: LanguageMap<string> = {
  zh: '中文',
  ko: '한국어',
  en: 'English',
};

function parseMarkdown(raw: string) {
  if (!raw.startsWith('---\n')) {
    return { attributes: {} as Record<string, string>, content: raw };
  }

  const closingFence = raw.indexOf('\n---\n', 4);
  if (closingFence === -1) {
    return { attributes: {} as Record<string, string>, content: raw };
  }

  const attributes = Object.fromEntries(
    raw
      .slice(4, closingFence)
      .split('\n')
      .map((line) => line.match(/^([A-Za-z][\w-]*):\s*["']?(.*?)["']?\s*$/))
      .filter((match): match is RegExpMatchArray => Boolean(match))
      .map((match) => [match[1], match[2]]),
  );

  return {
    attributes,
    content: raw.slice(closingFence + 5).trim(),
  };
}

function missingVersion(id: string, language: Language): DocumentVersion {
  return {
    title: id,
    description: `${languageNames[language]} version is missing.`,
    updated: '—',
    content: `# Missing translation\n\nCreate \`docs/${id}/${language}.md\` and run the translation sync skill.`,
  };
}

export function getDocuments(): DocumentSet[] {
  const collected = new Map<string, Partial<LanguageMap<DocumentVersion>>>();

  for (const [path, raw] of Object.entries(sourceFiles)) {
    const match = path.match(/\.\.\/docs\/([^/]+)\/(zh|ko|en)\.md$/);
    if (!match) continue;

    const [, id, languageValue] = match;
    const language = languageValue as Language;
    const { attributes, content } = parseMarkdown(raw);
    const versions = collected.get(id) ?? {};

    versions[language] = {
      title: attributes.title || id,
      description: attributes.description || '',
      updated: attributes.updated || '—',
      content,
    };
    collected.set(id, versions);
  }

  return [...collected.entries()]
    .map(([id, versions]) => ({
      id,
      versions: Object.fromEntries(
        languages.map((language) => [
          language,
          versions[language] ?? missingVersion(id, language),
        ]),
      ) as LanguageMap<DocumentVersion>,
    }))
    .sort((a, b) => a.versions.en.title.localeCompare(b.versions.en.title));
}
