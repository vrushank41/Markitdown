import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownPreview({ markdown }: { markdown: string }) {
  return (
    <div className="markdown-preview">
      {markdown.trim().length > 0 ? (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      ) : (
        <p className="empty-preview">Converted Markdown will render here.</p>
      )}
    </div>
  );
}
