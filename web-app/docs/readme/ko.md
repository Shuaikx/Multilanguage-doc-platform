---
title: Parallel Docs 사용 안내
description: 로컬 삼개 언어 Markdown 문서 작업 공간
lang: ko
translationKey: readme
updated: 2026-09-02
---

# Parallel Docs 사용 안내

Parallel Docs는 로컬에서만 실행되는 중국어, 한국어, 영어 문서 작업 공간입니다. 브라우저의 좌우 두 패널에서 같은 문서의 서로 다른 언어 버전을 표시하며, 각 패널 상단에서 언어를 독립적으로 전환할 수 있습니다.

## 빠른 시작

Node.js 22.13 이상이 필요합니다. `web-app` 디렉터리에서 실행합니다.

```powershell
npm install
npm run dev
```

터미널에 표시된 로컬 주소(일반적으로 `http://localhost:3000`)를 엽니다. 서버를 중지하려면 `Ctrl+C`를 누릅니다.

## 프로젝트 구조

```text
Multilanguage-doc-platform/
├─ .codex/skills/sync-doc-translations/  # 프로젝트 수준 동기화 skill
├─ web-app/
│  ├─ app/                               # 프런트엔드 인터페이스
│  └─ docs/<document-id>/                # 삼개 언어 Markdown
│     ├─ zh.md
│     ├─ ko.md
│     └─ en.md
├─ IMPLEMENTATION_PLAN.md
├─ p4ignore.txt                         # 상위 Perforce에서 전체 프로젝트 제외
└─ README.md
```

각 문서 디렉터리에는 `zh.md`, `ko.md`, `en.md`가 모두 있어야 합니다. 디렉터리 이름은 안정적인 문서 ID입니다.

## 새 문서 추가

1. `web-app/docs` 아래에 `release-process`처럼 소문자와 하이픈으로 된 디렉터리를 만듭니다.
2. 기존 문서의 frontmatter를 복사하고 세 파일의 `translationKey`를 같은 디렉터리 이름으로 설정합니다.
3. 원하는 언어 하나를 먼저 완성한 다음 동기화 skill을 호출합니다.
4. 새 디렉터리를 추가한 뒤에는 개발 서버를 다시 시작합니다. 기존 Markdown 수정은 일반적으로 자동 반영됩니다.

## 번역 한 번에 동기화

Codex에서 방금 수정한 원본 파일을 명확히 지정한 후 다음과 같이 호출합니다.

```text
$sync-doc-translations web-app/docs/readme/ko.md를 원본으로 사용해 나머지 두 언어 버전을 동기화하세요.
```

Skill은 지정한 원본 파일을 유일한 콘텐츠 기준으로 삼고 같은 디렉터리의 다른 두 언어 파일을 업데이트합니다. Markdown 구조, 코드, 명령, 경로, URL 및 frontmatter 키는 유지합니다. 이 기능은 백그라운드 파일 감시기가 아니므로 원본 언어 수정을 마칠 때마다 한 번 호출해야 합니다.

## 문서 세트 검증

Skill에 포함된 결정적 검증 스크립트를 별도로 실행할 수 있습니다.

```powershell
node .codex/skills/sync-doc-translations/scripts/validate-docs.mjs --root web-app/docs
```

검증은 세 언어 파일의 존재 여부, frontmatter 일치 여부, 제목·코드 블록·링크 대상 등의 구조 정렬을 확인합니다.

## 인터페이스 사용

- 왼쪽 문서 목록에서 문서를 선택합니다.
- 각 읽기 패널 상단의 toggle로 中文, 한국어 또는 English를 선택합니다.
- **Swap**으로 좌우 패널의 언어를 교환합니다.
- 좁은 화면에서는 두 읽기 패널이 위아래로 배치됩니다.

## Git 및 GitHub 작업 흐름

일반 `.md` 문서를 포함한 전체 프로젝트는 Git으로 관리하고 GitHub에 푸시합니다. 변경 후 `git status`와 `git diff`를 실행하고 세 언어 파일이 동기화되었는지 확인한 다음 커밋하고 푸시합니다.

```powershell
git status
git diff
git add web-app/docs/readme/zh.md web-app/docs/readme/ko.md web-app/docs/readme/en.md
git commit -m "docs: update readme translations"
git push
```

프로젝트 루트의 `p4ignore.txt`는 `**`를 사용해 전체 프로젝트를 제외하므로 외부 Perforce workspace가 이 프로젝트를 수집하지 않습니다. 자격 증명이나 로컬 환경 파일을 Git에 커밋하지 마세요.

## 로컬 빌드

`npm run build`로 프로덕션 빌드를 검증합니다. 이 프로젝트에는 데이터베이스, 로그인, 외부 API 또는 클라우드 배포가 필요하지 않으며 `.gitignore`는 `node_modules`, `.vinext`, `.wrangler`, `dist` 같은 생성 콘텐츠를 제외합니다.
