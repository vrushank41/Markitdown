import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { DocumentSummary } from "@/lib/types";
import {
  convertStoredDocument,
  fetchRemoteDocument,
  listDocuments,
  readDocumentMarkdown,
  updateDocumentMarkdown,
  uploadDocument,
} from "./client";

export type Theme = "light" | "dark";
export type WorkspaceTab = "markdown" | "preview" | "original";

export interface ConverterWorkspaceProps {
  initialDocuments?: DocumentSummary[];
  initialMarkdown?: string;
}

const THEME_KEY = "markitdown-theme";
const THEME_CHANGE_EVENT = "markitdown-theme-change";

function getStoredTheme(): Theme {
  return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
}

function getServerTheme(): Theme {
  return "light";
}

function subscribeToTheme(onStoreChange: () => void) {
  const listener = () => onStoreChange();
  window.addEventListener("storage", listener);
  window.addEventListener(THEME_CHANGE_EVENT, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(THEME_CHANGE_EVENT, listener);
  };
}

function saveStoredTheme(nextTheme: Theme) {
  localStorage.setItem(THEME_KEY, nextTheme);
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function useConverterWorkspace({
  initialDocuments = [],
  initialMarkdown = "",
}: ConverterWorkspaceProps) {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getStoredTheme,
    getServerTheme,
  );
  const [documents, setDocuments] = useState<DocumentSummary[]>(initialDocuments);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pendingDocument, setPendingDocument] = useState<DocumentSummary | null>(null);
  const [activeDocument, setActiveDocument] = useState<DocumentSummary | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [originalMarkdown, setOriginalMarkdown] = useState(initialMarkdown);
  const [activeWorkspaceTab, setActiveWorkspaceTab] =
    useState<WorkspaceTab>("markdown");
  const [message, setMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const canConvert = Boolean(selectedFile || pendingDocument);

  const activeStatus = useMemo(() => {
    if (activeDocument) {
      return `${activeDocument.fileName} \u2022 ${activeDocument.status}`;
    }
    if (pendingDocument) {
      return `${pendingDocument.fileName} \u2022 ready`;
    }
    if (selectedFile) {
      return `${selectedFile.name} \u2022 ready`;
    }
    return "No document selected";
  }, [activeDocument, pendingDocument, selectedFile]);

  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    listDocuments().then(setDocuments).catch(() => {
      setMessage("Saved documents are unavailable in this browser session.");
    });
  }, []);

  function applyTheme(nextTheme: Theme) {
    saveStoredTheme(nextTheme);
  }

  function onFileSelected(file: File | undefined) {
    if (!file) {
      return;
    }
    setSelectedFile(file);
    setPendingDocument(null);
    setMessage("");
  }

  async function refreshDocuments() {
    setDocuments(await listDocuments());
  }

  async function fetchUrl() {
    if (!urlInput.trim()) {
      setMessage("Enter a public file URL.");
      return;
    }

    setIsBusy(true);
    setMessage("Fetching file...");
    try {
      const document = await fetchRemoteDocument(urlInput.trim());
      setPendingDocument(document);
      setSelectedFile(null);
      setMessage("File fetched. Confirm conversion when ready.");
      await refreshDocuments();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Fetch failed.");
    } finally {
      setIsBusy(false);
    }
  }

  async function uploadSelectedFile() {
    if (!selectedFile) {
      return pendingDocument;
    }
    return uploadDocument(selectedFile);
  }

  async function convertDocument() {
    if (!canConvert) {
      return;
    }

    setIsBusy(true);
    setMessage("Converting document...");
    try {
      const document = await uploadSelectedFile();
      if (!document) {
        return;
      }

      const converted = await convertStoredDocument(document.id);
      const convertedMarkdown = await readDocumentMarkdown(document.id);

      setActiveDocument(converted);
      setPendingDocument(null);
      setSelectedFile(null);
      setMarkdown(convertedMarkdown);
      setOriginalMarkdown(convertedMarkdown);
      setActiveWorkspaceTab("markdown");
      setMessage(`Converted ${converted.fileName}.`);
      await refreshDocuments();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Conversion failed.");
    } finally {
      setIsBusy(false);
    }
  }

  async function openDocument(document: DocumentSummary) {
    setIsBusy(true);
    setMessage(`Opening ${document.fileName}...`);
    try {
      const nextMarkdown = await readDocumentMarkdown(document.id);
      setActiveDocument(document);
      setMarkdown(nextMarkdown);
      setOriginalMarkdown(nextMarkdown);
      setActiveWorkspaceTab("markdown");
      setMessage(`Opened ${document.fileName}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Open failed.");
    } finally {
      setIsBusy(false);
    }
  }

  async function saveMarkdown() {
    if (!activeDocument) {
      return;
    }
    setIsBusy(true);
    try {
      const document = await updateDocumentMarkdown(activeDocument.id, markdown);
      setActiveDocument(document);
      setMessage("Markdown saved.");
      await refreshDocuments();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setIsBusy(false);
    }
  }

  async function copyMarkdown() {
    await navigator.clipboard.writeText(markdown);
    setMessage("Markdown copied.");
  }

  function downloadMarkdown() {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = `${activeDocument?.fileName ?? "document"}.md`;
    link.click();
    URL.revokeObjectURL(href);
  }

  return {
    activeDocument,
    activeStatus,
    activeWorkspaceTab,
    applyTheme,
    canConvert,
    convertDocument,
    copyMarkdown,
    documents,
    downloadMarkdown,
    fetchUrl,
    fileInputRef,
    isBusy,
    isDragging,
    markdown,
    message,
    onFileSelected,
    openDocument,
    originalMarkdown,
    pendingDocument,
    saveMarkdown,
    selectedFile,
    setActiveWorkspaceTab,
    setIsDragging,
    setMarkdown,
    setUrlInput,
    theme,
    urlInput,
  };
}
