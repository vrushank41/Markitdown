# MarkItDown Next.js App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js App Router document-to-Markdown converter with upload/URL ingestion, local-session saved documents, editable Markdown preview, light/dark theme, and serverless-compatible route boundaries.

**Architecture:** The App Router page renders the shell on the server and mounts a client workspace for upload, conversion, editing, and preview interactions. Route Handlers expose document APIs; storage and conversion live behind focused library interfaces so local filesystem storage can be swapped for Blob/S3 and a MarkItDown worker/API in production serverless deployments.

**Tech Stack:** Next.js 16.2.9, React 19.2.7, TypeScript, Vitest, React Testing Library, Framer Motion 12.41.0, react-markdown, remark-gfm, pdf-parse, local JSON/file storage adapter for development.

---

## File Structure

- `package.json`: scripts and dependencies.
- `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`, `vitest.config.ts`: framework and verification config.
- `src/app/layout.tsx`: server-rendered root layout and metadata.
- `src/app/page.tsx`: server-rendered landing/workspace page.
- `src/app/globals.css`: final palette, responsive layout, light/dark variables.
- `src/components/converter-workspace.tsx`: client component for upload, URL fetch, conversion, editor, preview, saved documents, and theme behavior.
- `src/components/markdown-preview.tsx`: rendered Markdown view.
- `src/lib/types.ts`: shared document/status types.
- `src/lib/session.ts`: local session id cookie helpers.
- `src/lib/storage.ts`: document metadata and file/Markdown storage.
- `src/lib/converter.ts`: MarkItDown command adapter plus local fallback converters.
- `src/lib/url-safety.ts`: public URL validation and fetch safeguards.
- `src/app/api/documents/route.ts`: list saved documents.
- `src/app/api/documents/upload/route.ts`: upload file.
- `src/app/api/documents/fetch-url/route.ts`: fetch public file URL.
- `src/app/api/documents/[id]/route.ts`: get/delete metadata.
- `src/app/api/documents/[id]/convert/route.ts`: convert document.
- `src/app/api/documents/[id]/markdown/route.ts`: get/save Markdown.
- `src/app/api/documents/[id]/file/route.ts`: fetch original file.
- `src/test/*`: unit/component tests.

## Tasks

### Task 1: Scaffold Next.js And Verification

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`, `vitest.config.ts`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

- [ ] Create package/config files with Next.js, React, Vitest, Testing Library, Framer Motion, react-markdown, remark-gfm, and pdf-parse.
- [ ] Create a minimal App Router page rendering "Convert documents to Markdown".
- [ ] Run `npm install`.
- [ ] Run `npm run test`; expected: no tests or passing setup.
- [ ] Run `npm run build`; expected: Next production build succeeds.

### Task 2: Domain Types, Session, Storage, And URL Safety With TDD

**Files:**
- Create: `src/lib/types.ts`, `src/lib/session.ts`, `src/lib/storage.ts`, `src/lib/url-safety.ts`
- Create tests: `src/test/storage.test.ts`, `src/test/url-safety.test.ts`

- [ ] Write failing tests proving metadata is created, listed by session, Markdown edits persist, delete removes a document, and private-network URLs are rejected.
- [ ] Run `npm run test -- src/test/storage.test.ts src/test/url-safety.test.ts`; expected: tests fail because modules do not exist.
- [ ] Implement types, file storage under `.data/markitdown`, JSON metadata persistence, session id helpers, and URL validation.
- [ ] Run the same tests; expected: pass.

### Task 3: Conversion Layer With TDD

**Files:**
- Create: `src/lib/converter.ts`
- Create test: `src/test/converter.test.ts`

- [ ] Write failing tests for text, JSON, CSV, and fallback conversion behavior.
- [ ] Run `npm run test -- src/test/converter.test.ts`; expected: tests fail because converter does not exist.
- [ ] Implement conversion adapter. If `MARKITDOWN_COMMAND` is set, run it against the stored file; otherwise use local fallback conversion for text/JSON/CSV/HTML/PDF text extraction.
- [ ] Run the converter tests; expected: pass.

### Task 4: Route Handlers With TDD

**Files:**
- Create API route files under `src/app/api/documents/**/route.ts`
- Create test: `src/test/api.test.ts`

- [ ] Write failing tests that call the shared handler logic for list, upload, convert, Markdown read/update, and delete.
- [ ] Run `npm run test -- src/test/api.test.ts`; expected: tests fail because handlers do not exist.
- [ ] Implement route handlers using `runtime = "nodejs"` and the storage/converter helpers.
- [ ] Run API tests; expected: pass.

### Task 5: React UI Components With TDD

**Files:**
- Create: `src/components/converter-workspace.tsx`, `src/components/markdown-preview.tsx`
- Create tests: `src/test/converter-workspace.test.tsx`, `src/test/markdown-preview.test.tsx`
- Modify: `src/app/page.tsx`, `src/app/globals.css`

- [ ] Write failing component tests for theme toggle, disabled Convert state, selected file confirmation, Markdown editing, and rendered preview.
- [ ] Run `npm run test -- src/test/converter-workspace.test.tsx src/test/markdown-preview.test.tsx`; expected: fail because components do not exist.
- [ ] Implement components using Framer Motion for subtle panel/drag/progress transitions, react-markdown for preview, and CSS classes from the approved palette.
- [ ] Run component tests; expected: pass.

### Task 6: End-To-End Verification And Polish

**Files:**
- Modify as needed: UI/API files above.
- Create: `.gitignore`, `.env.example`, `README.md`

- [ ] Add `.gitignore` entries for `.data`, `.next`, `node_modules`, and `.superpowers`.
- [ ] Add `.env.example` documenting `MARKITDOWN_COMMAND` and local storage behavior.
- [ ] Add README with local run, serverless deployment notes, storage adapter caveat, and test commands.
- [ ] Run `npm run lint`; expected: no errors.
- [ ] Run `npm run test`; expected: all tests pass.
- [ ] Run `npm run build`; expected: production build succeeds.
- [ ] Start `npm run dev` and provide the local URL.

## Self-Review

- Spec coverage: layout, palette, no auth/pricing, theme toggle, upload/URL, confirm, conversion, editable Markdown, live preview, saved document fetch on load, and backend storage are covered.
- Serverless caveat: durable file storage cannot be local filesystem in production serverless. The implementation will use local filesystem for this workspace and keep the adapter boundary explicit for Blob/S3 replacement.
- No placeholders: tasks name concrete files and verification commands.
