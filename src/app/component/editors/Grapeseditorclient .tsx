"use client";

import "grapesjs/dist/css/grapes.min.css";
import { useEffect, useId, useRef, useState } from "react";
import type { Editor } from "grapesjs";

// grapesjs-preset-newsletter ships no types - declared inline so this
// stays a single, self-contained file.
declare module "grapesjs-preset-newsletter";

interface GrapesEditorClientProps {
  value: string;
  onChange: (html: string) => void;
  /**
   * Backend endpoint that stores an uploaded image and returns { data: [url] }.
   * MUST be an absolute URL if your backend lives on a different origin than
   * this frontend (e.g. "https://api.yourapp.com/api/uploads/image") -
   * a relative path here will hit this Next.js app's own origin instead.
   * Defaults to NEXT_PUBLIC_API_URL + "/api/uploads/image" if that env var is set.
   */
  uploadUrl?: string;
  /** Pass "include" if your upload route needs cookies/session auth sent cross-origin. */
  uploadCredentials?: "include" | "omit" | "same-origin";
  /** Extra headers for the upload request, e.g. { Authorization: `Bearer ${token}` }. */
  uploadHeaders?: Record<string, string>;
  /** Called whenever an image upload fails, so the host app can show a toast/message. */
  onUploadError?: (error: unknown) => void;
  minHeight?: string;
}

const defaultUploadUrl = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/uploads/image`
  : "/api/uploads/image";

export default function GrapesEditorClient({
  value,
  onChange,
  uploadUrl = defaultUploadUrl,
  uploadCredentials,
  uploadHeaders,
  onUploadError,
  minHeight = "550px",
}: GrapesEditorClientProps) {
  const editorRef = useRef<Editor | null>(null);
  const lastEmittedRef = useRef<string>(value || "");
  const initialValueRef = useRef<string>(value || "");
  const onUploadErrorRef = useRef(onUploadError);
  const [ready, setReady] = useState(false);

  onUploadErrorRef.current = onUploadError;

  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const containerId = `gjs-editor-${rawId}`;

  useEffect(() => {
    let cancelled = false;
    let debounceTimer: ReturnType<typeof setTimeout>;
    let editor: Editor | null = null;

    (async () => {
      const [{ default: grapesjs }, { default: newsletterPlugin }] = await Promise.all([
        import("grapesjs"),
        // @ts-ignore - no bundled types, declared inline above
        import("grapesjs-preset-newsletter"),
      ]);

      if (cancelled) return;

      editor = grapesjs.init({
        container: `#${containerId}`,
        height: minHeight,
        width: "auto",
        fromElement: false,
        storageManager: false,
        plugins: [newsletterPlugin],
        pluginsOpts: {
          [newsletterPlugin as any]: {
            modalTitleImport: "Import template",
            modalTitleExport: "Export HTML",
            modalLabelImport: "Paste your HTML/table code below and click Import",
            modalLabelExport: "Copy the code below and use it wherever you need",
          },
        },
        assetManager: {
          upload: uploadUrl,
          uploadName: "file",
          multiUpload: false,
          autoAdd: true,
          ...(uploadCredentials ? { credentials: uploadCredentials } : {}),
          ...(uploadHeaders ? { headers: uploadHeaders } : {}),
        },
      } as any);

      // Surface upload failures instead of letting them fail silently -
      // e.g. CORS errors, 404s from a wrong uploadUrl, or backend 500s.
      editor.on("asset:upload:error", (err: unknown) => {
        console.error("GrapesJS asset upload failed:", err);
        onUploadErrorRef.current?.(err);
      });

      if (initialValueRef.current) {
        editor.setComponents(initialValueRef.current);
      }

      const emitChange = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          if (!editor) return;

          // Email clients (Outlook, Yahoo, many corporate filters) strip
          // <style> blocks unpredictably. gjs-get-inlined-html (from the
          // newsletter preset) runs juice under the hood and pushes every
          // style directly onto its element's `style` attribute instead,
          // which survives across virtually all email clients.
          let fullHtml: string;
          if (editor.Commands.has("gjs-get-inlined-html")) {
            fullHtml = editor.runCommand("gjs-get-inlined-html") || "";
          } else {
            // Fallback for older plugin versions where the command isn't
            // registered. Still wrapped in a valid <html>/<head> skeleton
            // (unlike a bare `<style>...</style><body>` fragment), but you
            // should inline styles server-side (e.g. with the `juice` npm
            // package) right before sending, since this fallback path does
            // NOT inline CSS onto elements.
            console.warn(
              "gjs-get-inlined-html command not available - falling back to " +
                "un-inlined HTML. Consider inlining CSS server-side (e.g. with " +
                "the `juice` package) before sending this as an email."
            );
            const css = editor.getCss() || "";
            const html = editor.getHtml() || "";
            fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8">${
              css ? `<style>${css}</style>` : ""
            }</head><body>${html}</body></html>`;
          }

          lastEmittedRef.current = fullHtml;
          onChange(fullHtml);
        }, 300);
      };

      // "update" covers most structural/style changes, but text edits made
      // via the rich text editor don't always trigger it reliably across
      // versions - so we also hook component updates and RTE session end.
      editor.on("update", emitChange);
      editor.on("component:update", emitChange);
      editor.on("rte:disable", emitChange);

      editorRef.current = editor;
      setReady(true);
    })();

    return () => {
      cancelled = true;
      clearTimeout(debounceTimer);
      editor?.destroy();
      editorRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!ready || !editor) return;
    if (value !== lastEmittedRef.current) {
      editor.setComponents(value || "");
      lastEmittedRef.current = value || "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, ready]);

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden relative">
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400 bg-white z-10">
          Loading editor...
        </div>
      )}
      <div id={containerId} style={{ minHeight }} />
    </div>
  );
}