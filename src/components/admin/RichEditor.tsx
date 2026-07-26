import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo2,
  Redo2,
  Code,
  Minus,
} from "lucide-react";
import { toast } from "sonner";
import { uploadMediaFile } from "@/lib/media-client";

function TB({
  active,
  onClick,
  label,
  children,
  disabled,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`size-8 grid place-items-center rounded-sm text-sm transition-colors ${
        active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      } disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor, folder }: { editor: Editor; folder: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border p-1.5 sticky top-0 bg-background z-10">
      <TB label="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
        <Undo2 className="size-4" />
      </TB>
      <TB label="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
        <Redo2 className="size-4" />
      </TB>
      <div className="w-px h-5 bg-border mx-1" />
      <TB label="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="size-4" />
      </TB>
      <TB label="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="size-4" />
      </TB>
      <TB label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="size-4" />
      </TB>
      <TB label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="size-4" />
      </TB>
      <TB label="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
        <Code className="size-4" />
      </TB>
      <div className="w-px h-5 bg-border mx-1" />
      <TB label="Bulleted list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="size-4" />
      </TB>
      <TB label="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="size-4" />
      </TB>
      <TB label="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="size-4" />
      </TB>
      <TB label="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus className="size-4" />
      </TB>
      <div className="w-px h-5 bg-border mx-1" />
      <TB
        label="Link"
        active={editor.isActive("link")}
        onClick={() => {
          const prev = editor.getAttributes("link").href as string | undefined;
          const href = window.prompt("URL", prev ?? "https://");
          if (href === null) return;
          if (href === "") editor.chain().focus().unsetLink().run();
          else editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
        }}
      >
        <LinkIcon className="size-4" />
      </TB>
      <TB label="Insert image" onClick={() => fileRef.current?.click()}>
        <ImageIcon className="size-4" />
      </TB>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          try {
            const url = await uploadMediaFile(f, folder);
            editor.chain().focus().setImage({ src: url, alt: f.name }).run();
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Upload failed");
          }
        }}
      />
    </div>
  );
}

export function RichEditor({
  name,
  defaultValue,
  placeholder,
  folder = "content",
}: {
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  folder?: string;
}) {
  const hiddenRef = useRef<HTMLInputElement>(null);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } }),
      Image.configure({ HTMLAttributes: { class: "rounded-md my-4 max-w-full h-auto" } }),
      Placeholder.configure({ placeholder: placeholder ?? "Write the article…" }),
    ],
    content: defaultValue || "",
    onUpdate: ({ editor }) => {
      if (hiddenRef.current) hiddenRef.current.value = editor.getHTML();
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral max-w-none min-h-[360px] p-5 focus:outline-none text-[15px] leading-relaxed",
      },
    },
  });

  useEffect(() => {
    return () => editor?.destroy();
  }, [editor]);

  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
        Body
      </label>
      <div className="border border-border rounded-md overflow-hidden bg-background">
        {editor ? <Toolbar editor={editor} folder={folder} /> : null}
        <EditorContent editor={editor} />
      </div>
      <input ref={hiddenRef} type="hidden" name={name} defaultValue={defaultValue ?? ""} />
    </div>
  );
}
