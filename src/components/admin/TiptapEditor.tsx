"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Undo2,
} from "lucide-react";

/**
 * Rich Text Editor berbasis Tiptap dengan dukungan Heading, Bold, Italic,
 * Blockquote, List, dan Link serta pratinjau tipografi otomatis.
 */
export function TiptapEditor({
  initialContent,
  isSerif,
  onChange,
}: {
  initialContent: string;
  isSerif: boolean;
  onChange: (html: string) => void;
}) {
  const [isLinkInputOpen, setIsLinkInputOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          HTMLAttributes: {
            rel: "noopener noreferrer",
            target: "_blank",
          },
        },
      }),
      Placeholder.configure({
        placeholder: "Mulai menulis isi berita, artikel, atau cerpen di sini...",
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "prose prose-zinc dark:prose-invert max-w-none min-h-80 px-4 py-4 focus:outline-none prose-a:text-accent prose-blockquote:border-accent",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  if (!editor) {
    return (
      <div className="min-h-96 rounded-xl border border-input-border bg-background p-4 text-sm text-muted">
        Memuat editor tulisan...
      </div>
    );
  }

  const openLinkEditor = () => {
    const existingHref = editor.getAttributes("link").href as string | undefined;
    setLinkUrl(existingHref ?? "https://");
    setIsLinkInputOpen((prev) => !prev);
  };

  const applyLink = () => {
    const trimmed = linkUrl.trim();
    if (!trimmed) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setIsLinkInputOpen(false);
      return;
    }

    const safeHref =
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("mailto:")
        ? trimmed
        : `https://${trimmed}`;

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: safeHref })
      .run();
    setIsLinkInputOpen(false);
  };

  const toolbarBtnClass = (isActive: boolean) =>
    `inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-md border text-sm transition-colors ${
      isActive
        ? "border-accent bg-accent text-accent-foreground"
        : "border-transparent bg-transparent text-muted hover:bg-background hover:text-foreground"
    }`;

  return (
    <div className="overflow-hidden rounded-xl border border-input-border bg-background">
      {/* Toolbar Editor */}
      <div
        role="toolbar"
        aria-label="Alat format tulisan"
        className="flex flex-wrap items-center gap-1 border-b border-border bg-surface p-1.5"
      >
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          aria-pressed={editor.isActive("heading", { level: 2 })}
          aria-label="Heading 2"
          className={toolbarBtnClass(editor.isActive("heading", { level: 2 }))}
        >
          <Heading2 className="h-4 w-4" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          aria-pressed={editor.isActive("heading", { level: 3 })}
          aria-label="Heading 3"
          className={toolbarBtnClass(editor.isActive("heading", { level: 3 }))}
        >
          <Heading3 className="h-4 w-4" aria-hidden="true" />
        </button>

        <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-pressed={editor.isActive("bold")}
          aria-label="Cetak tebal"
          className={toolbarBtnClass(editor.isActive("bold"))}
        >
          <Bold className="h-4 w-4" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-pressed={editor.isActive("italic")}
          aria-label="Cetak miring"
          className={toolbarBtnClass(editor.isActive("italic"))}
        >
          <Italic className="h-4 w-4" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          aria-pressed={editor.isActive("blockquote")}
          aria-label="Kutipan"
          className={toolbarBtnClass(editor.isActive("blockquote"))}
        >
          <Quote className="h-4 w-4" aria-hidden="true" />
        </button>

        <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-pressed={editor.isActive("bulletList")}
          aria-label="Daftar poin"
          className={toolbarBtnClass(editor.isActive("bulletList"))}
        >
          <List className="h-4 w-4" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          aria-pressed={editor.isActive("orderedList")}
          aria-label="Daftar bernomor"
          className={toolbarBtnClass(editor.isActive("orderedList"))}
        >
          <ListOrdered className="h-4 w-4" aria-hidden="true" />
        </button>

        <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />

        <button
          type="button"
          onClick={openLinkEditor}
          aria-pressed={editor.isActive("link") || isLinkInputOpen}
          aria-label="Sisipkan atau ubah tautan"
          className={toolbarBtnClass(
            editor.isActive("link") || isLinkInputOpen
          )}
        >
          <Link2 className="h-4 w-4" aria-hidden="true" />
        </button>

        {editor.isActive("link") ? (
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetLink().run()}
            aria-label="Hapus tautan"
            className={toolbarBtnClass(false)}
          >
            <Link2Off className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}

        <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          aria-disabled={!editor.can().undo()}
          aria-label="Urungkan"
          className={toolbarBtnClass(false)}
        >
          <Undo2 className="h-4 w-4" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          aria-disabled={!editor.can().redo()}
          aria-label="Ulangi"
          className={toolbarBtnClass(false)}
        >
          <Redo2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Bar Input Tautan Inline */}
      {isLinkInputOpen ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface/70 px-3 py-2">
          <label htmlFor="tiptap-link-url" className="sr-only">
            URL Tautan
          </label>
          <input
            id="tiptap-link-url"
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://contoh.com"
            className="min-h-11 flex-1 rounded-md border border-input-border bg-background px-3 text-sm text-foreground"
          />
          <button
            type="button"
            onClick={applyLink}
            className="inline-flex min-h-11 cursor-pointer items-center rounded-md bg-accent px-3.5 text-xs font-semibold text-accent-foreground"
          >
            Terapkan
          </button>
          <button
            type="button"
            onClick={() => setIsLinkInputOpen(false)}
            className="inline-flex min-h-11 cursor-pointer items-center rounded-md border border-border bg-background px-3 text-xs text-muted hover:text-foreground"
          >
            Batal
          </button>
        </div>
      ) : null}

      {/* Area Menulis Tiptap */}
      <div className={isSerif ? "font-serif leading-loose" : "font-sans leading-relaxed"}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
