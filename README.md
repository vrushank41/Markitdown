# MarkItDown Converter

A Next.js app for turning uploaded files and public URLs into editable Markdown. Preview the result, save changes, and copy or download the Markdown.

## Run locally

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). For full document-format support, install [Microsoft MarkItDown](https://github.com/microsoft/markitdown) in the server environment:

```bash
python3 -m pip install 'markitdown[all]'
```

Without the CLI, the app can still convert text, Markdown, JSON, CSV, HTML, and text-based PDFs. See [`.env.example`](.env.example) for optional converter and storage settings.

## Checks

```bash
npm test
npm run lint
npm run build
```

On Node 26, run tests with `NODE_OPTIONS=--no-experimental-webstorage npm test`.

## Before deploying

The app stores documents under `.data/markitdown` and scopes them to a browser session cookie. There is no sign-in or cross-device sync. Use durable storage for production, and run document conversion in a restricted worker.
