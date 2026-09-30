# MarkItDown Converter UI Design

Date: 2026-06-24  
Status: Approved design direction, pending user review of written spec  
Reference mockup: `/Users/mmt12007/Documents/OmniRoute-AI(Go)/.superpowers/brainstorm/19899-1782274073/content/palette-v3.html`

## Product Intent

This web application converts uploaded documents into Markdown using a MarkItDown-inspired workflow. PDF is the primary entry case, but the interface should be ready for the broader MarkItDown surface: Word, PowerPoint, Excel, images, HTML, CSV, JSON, XML, EPUB, ZIP, and plain text. The audience already understands PDFs and Markdown, so the UI should focus on speed, clarity, and trustworthy feedback.

Microsoft describes MarkItDown as a lightweight Python package and command-line utility for converting files to Markdown for indexing, text analysis, LLM, and related workflows. Its GitHub README notes that it tries to preserve useful document structure such as headings, lists, tables, and links, while also warning that output is not meant to be pixel-perfect human document reconstruction. That matters for the UI: the preview must make structure easy to inspect and edit, not promise an exact visual clone of the source document. Reference: [microsoft/markitdown](https://github.com/microsoft/markitdown).

The approved direction keeps the first screen calm and focused: a centered upload-first experience, public URL fallback, explicit file confirmation, manual Convert action, and post-conversion workspace where raw Markdown is the primary editable surface. Pricing, sign-in, teams, and billing are out of scope.

## Design Philosophy

The interface should feel like a document workstation, not a marketing page. It uses a restrained layout with clear state gates: choose a document, confirm it, convert it, edit Markdown, and export or reopen saved work. This supports Nielsen Norman Group heuristics such as visibility of system status, user control, error prevention, recognition over recall, and minimalist design. Reference: [NN/g 10 usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/).

The palette is cooler and cleaner than the reference screenshot: pearl gray page background, white panels, soft green-gray upload areas, graphite text, teal primary actions, indigo file accents, green success states, amber warnings, and dark editor surfaces. Light and dark themes use the same CSS variables. Text contrast must meet WCAG 2.2 AA expectations: normal text should target at least 4.5:1 contrast and large text at least 3:1. Reference: [WCAG 2.2 contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum).

Typography should use a modern sans-serif for the shell, such as Inter or system UI, and a monospace font for the Markdown editor, such as JetBrains Mono or SFMono. The reference informs layout and rhythm, not final brand styling.

## Core Screens And Components

### 1. Header

The header contains only the product mark/name on the left and a Light/Dark segmented theme control on the right. There is no Pricing link and no Sign in button. The theme control should be a real toggle or segmented control, persist its preference in local storage, and respect the saved value on reload.

### 2. Upload Panel

The upload panel is the visual anchor of the first state. It includes:

- Step marker: "1 Upload file to convert".
- Dashed drag-and-drop zone with a file icon, "Upload your file", short accepted-format helper text, and a Select file button.
- Divider reading "or from website / public file URL".
- URL input and Fetch button.
- Session usage row, for example "0/3 documents this session" and "Max 25 MB".
- Disabled Convert button until a valid file or URL is present.

This prevents accidental conversion by separating selection from conversion. After selection, the UI advances to confirmation.

### 3. Selected File Confirmation

After a user selects a file or fetches a URL, show a compact confirmation card with:

- File type badge such as PDF, DOCX, XLSX, or URL.
- Filename, size, source, and detected type.
- Status chip: Ready, Needs review, Unsupported, or Error.
- Primary button: Convert to Markdown.

This is where validation feedback appears. Scanned or image-only PDFs should show an OCR notice or limited-result warning instead of failing silently: "This PDF appears to be scanned. Text extraction may be limited unless OCR is enabled."

### 4. Conversion State

During conversion, replace the primary button with progress. Show file name, elapsed time, and current stage: Uploading, Validating, Converting, Saving, or Ready. The user should be able to cancel before completion.

### 5. Markdown Workspace

After conversion, the workspace opens to the right of the upload/confirmation stack on desktop. Raw Markdown is primary. Rendered preview is secondary.

The workspace includes:

- Tabs: Markdown, Rendered preview, Original file.
- Tool actions: Copy, Download `.md`, Reset.
- Editable Markdown editor occupying the larger left pane.
- Rendered preview pane occupying the smaller right pane.
- Status footer: conversion time, save state, and edit state.

The Markdown editor is editable immediately. The rendered preview updates live as the user types. Reset restores the original converted Markdown after confirmation. Download and Copy use the current editor content.

### 6. Saved Documents

Because there is no sign-in model yet, saved documents belong to the local browser/session. Show a compact "Saved documents" or "Recent documents" area below the workspace or in a collapsible panel on smaller screens. Each item includes type badge, filename, converted date, and Open button.

On reload, the app fetches saved metadata and allows reopening the stored original plus latest Markdown. This makes storage visible without implying cross-device accounts.

## Wireframes

Desktop:

```text
Header: [MarkItDown]                                      [Light | Dark]

          Convert documents to Markdown
          Upload, confirm, edit, preview, export.

+----------------------------------+  +-------------------------------------------+
| 1 Upload file to convert         |  | [Markdown] [Rendered preview] [Original]  |
|                                  |  |                         Copy Download Reset|
|  +----------------------------+  |  +------------------------+------------------+
|  | Drop file / Select file    |  |  | Editable Markdown      | Rendered preview |
|  +----------------------------+  |  | editor                 |                  |
|  or URL [input] [Fetch]          |  |                        |                  |
|  [Convert disabled/enabled]      |  +------------------------+------------------+
+----------------------------------+
| 2 Confirm selected file          |
| [PDF] quarterly-report.pdf Ready |
| [Convert to Markdown]            |
+----------------------------------+
```

Mobile:

```text
[MarkItDown] [Light | Dark]
Headline
Upload panel
Confirmation panel
Markdown tab
Rendered preview tab
Saved documents
```

## Responsive Behavior

Desktop uses two columns: upload/confirm stack on the left, editor workspace on the right. Tablet stacks upload above the workspace and keeps Markdown and rendered preview as tabs or stacked panels. Mobile uses one column, full-width controls, and tabs to avoid cramped side-by-side editing.

## Framer Motion Guidance

Animations should clarify state changes, not decorate the app. Use Framer Motion for:

- Drag-over feedback: subtle scale or border-color change on the upload zone.
- Panel reveal: confirmation card slides/fades in after file selection.
- Conversion progress: small determinate or indeterminate progress animation.
- Workspace reveal: editor fades in once Markdown is ready.
- Theme transition: quick color interpolation without large layout movement.
- Saved-document reload: lightweight staggered fade for recent items.

Avoid spinning 3D objects or heavy transitions. If any 3D effect is used, limit it to a slight card tilt on drag-over or hover and reduce it for users who prefer reduced motion.

## Backend And Data Flow

The backend must store originals and converted Markdown. Since auth is out of scope, ownership is session-based:

1. Browser creates or receives a local `client_session_id`.
2. `GET /api/documents` fetches saved document metadata for that session on load.
3. `POST /api/documents/upload` stores an uploaded file and returns a document id plus detected metadata.
4. `POST /api/documents/fetch-url` validates and fetches a public URL, then stores it as a document.
5. `POST /api/documents/:id/convert` runs MarkItDown and persists Markdown output.
6. `GET /api/documents/:id` returns metadata and conversion status.
7. `GET /api/documents/:id/file` retrieves the original file if needed.
8. `GET /api/documents/:id/markdown` retrieves editable Markdown.
9. `PUT /api/documents/:id/markdown` saves user edits.
10. `DELETE /api/documents/:id` removes a saved document.

Store metadata with document id, session id, original filename, MIME type, size, source type, storage path, status, error message, timestamps, Markdown pointer, and last edited timestamp. Store files outside the public web root. The MarkItDown README warns that conversion performs I/O with current process privileges, so URL fetching and conversion must be sandboxed: validate schemes, limit file size, reject private-network URLs, use timeouts, scan MIME type, and call the narrowest suitable conversion function.

## Error Handling

Errors should be visible near the control that caused them. Examples:

- Invalid URL: "Enter a public http or https file URL."
- Unsupported file: "This file type is not supported yet."
- Oversized file: "This file is larger than the 25 MB limit."
- Conversion failure: "We could not convert this document. Try another file or download the original."
- Session expired: "Saved files for this browser are unavailable. Upload again to continue."

Users should retain the selected file card and be able to retry or remove the file.

## Testing Notes

Test upload selection, URL validation, disabled/enabled Convert states, conversion progress, editable Markdown, live preview, copy/download/reset, theme persistence, saved-document fetch on load, and desktop/tablet/mobile layouts. Accessibility checks include keyboard navigation, visible focus states, screen-reader labels, reduced motion, and color contrast in both themes.
