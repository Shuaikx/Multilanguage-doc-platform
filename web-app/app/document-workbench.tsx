'use client';

import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeftRight, BookOpenText, Check, FileText, Languages } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { DocumentSet, Language } from '@/lib/documents';

const languageOptions: Array<{ value: Language; label: string; short: string }> = [
  { value: 'zh', label: '中文', short: '中' },
  { value: 'ko', label: '한국어', short: '한' },
  { value: 'en', label: 'English', short: 'EN' },
];

function LanguageToggle({
  value,
  onChange,
  label,
}: {
  value: Language;
  onChange: (language: Language) => void;
  label: string;
}) {
  return (
    <ToggleGroup
      aria-label={label}
      value={[value]}
      onValueChange={(next) => next[0] && onChange(next[0] as Language)}
      variant="outline"
      size="sm"
      spacing={0}
      className="language-toggle"
    >
      {languageOptions.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          aria-label={option.label}
          title={option.label}
        >
          <span className="sm:hidden">{option.short}</span>
          <span className="hidden sm:inline">{option.label}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

function MarkdownPanel({
  document,
  language,
  onLanguageChange,
  side,
}: {
  document: DocumentSet;
  language: Language;
  onLanguageChange: (language: Language) => void;
  side: 'left' | 'right';
}) {
  const version = document.versions[language];

  return (
    <section className="document-panel" aria-label={`${version.title} — ${language}`}>
      <header className="panel-toolbar">
        <div>
          <p className="eyebrow">{side === 'left' ? 'SOURCE VIEW' : 'PARALLEL VIEW'}</p>
          <p className="panel-title">{version.title}</p>
        </div>
        <LanguageToggle
          value={language}
          onChange={onLanguageChange}
          label={`Choose language for the ${side} panel`}
        />
      </header>

      <div className="panel-meta">
        <span>{version.description}</span>
        <span>Updated {version.updated}</span>
      </div>

      <article className="markdown-body" lang={language === 'zh' ? 'zh-CN' : language}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{version.content}</ReactMarkdown>
      </article>
    </section>
  );
}

export function DocumentWorkbench({ documents }: { documents: DocumentSet[] }) {
  const [selectedId, setSelectedId] = useState(documents[0]?.id ?? '');
  const [leftLanguage, setLeftLanguage] = useState<Language>('zh');
  const [rightLanguage, setRightLanguage] = useState<Language>('en');

  const selectedDocument = useMemo(
    () => documents.find((document) => document.id === selectedId) ?? documents[0],
    [documents, selectedId],
  );

  if (!selectedDocument) {
    return (
      <main className="empty-state">
        <Languages aria-hidden="true" />
        <h1>No documents found</h1>
        <p>Add a folder with zh.md, ko.md, and en.md under web-app/docs.</p>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">文</span>
          <div>
            <p className="brand-name">Parallel Docs</p>
            <p className="brand-subtitle">中 · 한 · EN documentation workspace</p>
          </div>
        </div>

        <div className="header-status" aria-label="Document set status">
          <span className="status-dot" />
          <span>3 languages aligned</span>
          <Check aria-hidden="true" />
        </div>
      </header>

      <div className="workspace">
        <aside className="document-sidebar" aria-label="Documents">
          <div className="sidebar-heading">
            <div>
              <p className="eyebrow">LIBRARY</p>
              <h1>Documents</h1>
            </div>
            <span className="document-count">{documents.length}</span>
          </div>

          <nav className="document-list">
            {documents.map((document) => {
              const isActive = document.id === selectedDocument.id;
              return (
                <button
                  key={document.id}
                  type="button"
                  className="document-item"
                  data-active={isActive}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setSelectedId(document.id)}
                >
                  <FileText aria-hidden="true" />
                  <span>
                    <strong>{document.versions.en.title}</strong>
                    <small>{document.id}</small>
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="sidebar-note">
            <BookOpenText aria-hidden="true" />
            <p>Edit Markdown on disk, then invoke <code>$sync-doc-translations</code>.</p>
          </div>
        </aside>

        <section className="comparison-workspace" aria-label="Translation comparison">
          <div className="comparison-heading">
            <div>
              <p className="eyebrow">SIDE-BY-SIDE READER</p>
              <h2>{selectedDocument.versions.en.title}</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLeftLanguage(rightLanguage);
                setRightLanguage(leftLanguage);
              }}
              aria-label="Swap panel languages"
            >
              <ArrowLeftRight data-icon="inline-start" aria-hidden="true" />
              Swap
            </Button>
          </div>

          <div className="panel-grid">
            <MarkdownPanel
              document={selectedDocument}
              language={leftLanguage}
              onLanguageChange={setLeftLanguage}
              side="left"
            />
            <MarkdownPanel
              document={selectedDocument}
              language={rightLanguage}
              onLanguageChange={setRightLanguage}
              side="right"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
