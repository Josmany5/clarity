import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { common, createLowlight } from 'lowlight';

const lowlight = createLowlight(common);

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const MenuButton: React.FC<{
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title: string;
}> = ({ onClick, isActive, children, title }) => (
  <button
    onClick={onClick}
    type="button"
    title={title}
    className={`p-2 rounded-lg transition-colors ${
      isActive
        ? 'bg-accent text-white'
        : 'text-text-primary hover:bg-black/10 dark:hover:bg-white/10'
    }`}
  >
    {children}
  </button>
);

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start writing...',
}) => {
  const [showFormatting, setShowFormatting] = React.useState(true); // Always show toolbar by default

  // Convert markdown to HTML if content looks like markdown
  const convertMarkdownToHTML = (text: string): string => {
    if (!text) return '';

    // If already HTML, return as-is
    if (text.includes('<p>') || text.includes('<h1>') || text.includes('<h2>')) {
      return text;
    }

    // Simple markdown to HTML conversion
    let html = text;

    // Headers
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Unordered lists
    html = html.replace(/^- (.*?)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*?<\/li>\n?)+/g, '<ul>$&</ul>');
    html = html.replace(/<\/ul>\n?<ul>/g, '');

    // Paragraphs (any line not already wrapped)
    html = html.split('\n\n').map(para => {
      if (para.trim() && !para.match(/^<[hul]/)) {
        return `<p>${para}</p>`;
      }
      return para;
    }).join('');

    return html;
  };

  const initialContent = React.useMemo(() => convertMarkdownToHTML(content), []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use CodeBlockLowlight instead
        taskList: false, // We'll use TaskList extension instead
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-accent underline hover:text-accent-secondary',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none text-text-primary',
      },
    },
  });

  // Update editor content when content prop changes
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      const html = convertMarkdownToHTML(content);
      editor.commands.setContent(html);

      // Scroll to top when content changes
      const editorElement = document.querySelector('.flex-1.overflow-y-auto.p-6');
      if (editorElement) {
        editorElement.scrollTop = 0;
      }
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const addTimestamp = () => {
    const now = new Date();
    const timestamp = now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    editor
      .chain()
      .focus()
      .insertContent(`<p><strong>${timestamp}</strong></p>`)
      .run();
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Aa Button - Toggle Formatting Menu */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-card-border">
        <button
          onClick={() => setShowFormatting(!showFormatting)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-accent ${
            showFormatting
              ? 'bg-accent text-white'
              : 'bg-black/10 dark:bg-white/10 text-text-primary hover:bg-black/20 dark:hover:bg-white/20'
          }`}
          title="Toggle formatting options"
        >
          <span className="text-lg">Aa</span>
        </button>
      </div>

      {/* Formatting Menu - Visible by default */}
      {showFormatting && (
        <div className="flex flex-wrap gap-1 p-3 border-b border-card-border bg-black/5 dark:bg-white/5 animate-slideDown">
          {/* Text Formatting */}
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold (Ctrl+B)"
          >
            <strong>B</strong>
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic (Ctrl+I)"
          >
            <em>I</em>
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline (Ctrl+U)"
          >
            <u>U</u>
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strikethrough"
          >
            <s>S</s>
          </MenuButton>

          <div className="w-px h-6 bg-card-border mx-1" />

          {/* Headings */}
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <span className="text-xl font-bold">Title</span>
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <span className="text-lg font-bold">Heading</span>
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <span className="text-base font-semibold">Subheading</span>
          </MenuButton>

          <div className="w-px h-6 bg-card-border mx-1" />

          {/* Lists */}
          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <span className="text-2xl leading-none">•</span>
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <span className="text-lg font-bold">1.</span>
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            isActive={editor.isActive('taskList')}
            title="Task List"
          >
            <span className="text-xl">☐</span>
          </MenuButton>

          <div className="w-px h-6 bg-card-border mx-1" />

          {/* Code & Quote */}
          <MenuButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            title="Code Block"
          >
            <span className="font-mono text-sm">{'<code>'}</span>
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Blockquote"
          >
            <span className="text-lg italic">"</span>
          </MenuButton>

          <div className="w-px h-6 bg-card-border mx-1" />

          {/* Link & Timestamp */}
          <MenuButton
            onClick={setLink}
            isActive={editor.isActive('link')}
            title="Add Link"
          >
            🔗
          </MenuButton>
          <MenuButton onClick={addTimestamp} title="Insert Timestamp">
            🕒
          </MenuButton>

          <div className="w-px h-6 bg-card-border mx-1" />

          {/* Clear Formatting */}
          <MenuButton
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            title="Clear Formatting"
          >
            <span className="text-base font-semibold">✕</span>
          </MenuButton>
        </div>
      )}

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <EditorContent editor={editor} />
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }

        .ProseMirror {
          min-height: 100%;
          line-height: 1.8;
          font-size: 16px;
        }

        .ProseMirror:focus {
          outline: none;
        }

        .ProseMirror p {
          margin: 1em 0;
          line-height: 1.8;
        }

        .ProseMirror h1 {
          font-size: 2.25em;
          font-weight: 700;
          margin: 1.5em 0 0.75em 0;
          line-height: 1.3;
          letter-spacing: -0.02em;
          border-bottom: 2px solid;
          border-bottom-color: var(--accent-primary);
          padding-bottom: 0.3em;
        }

        .ProseMirror h2 {
          font-size: 1.75em;
          font-weight: 700;
          margin: 1.25em 0 0.6em 0;
          line-height: 1.35;
          letter-spacing: -0.01em;
        }

        .ProseMirror h3 {
          font-size: 1.4em;
          font-weight: 600;
          margin: 1.1em 0 0.55em 0;
          line-height: 1.4;
        }

        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 2em;
          margin: 1em 0;
          line-height: 1.8;
        }

        .ProseMirror ul {
          list-style-type: disc;
        }

        .ProseMirror ol {
          list-style-type: decimal;
        }

        .ProseMirror li {
          margin: 0.5em 0;
          padding-left: 0.3em;
        }

        .ProseMirror ul[data-type="taskList"] {
          list-style: none;
          padding-left: 0;
        }

        .ProseMirror ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          padding: 0.4em 0;
        }

        .ProseMirror ul[data-type="taskList"] li label {
          margin-right: 0.75em;
          user-select: none;
        }

        .ProseMirror ul[data-type="taskList"] li input[type="checkbox"] {
          cursor: pointer;
          width: 18px;
          height: 18px;
        }

        .ProseMirror code {
          background-color: color-mix(in srgb, var(--accent-primary) 15%, transparent);
          color: var(--accent-secondary);
          padding: 0.25em 0.5em;
          border-radius: 0.375em;
          font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
          font-size: 0.9em;
          font-weight: 500;
        }

        .ProseMirror pre {
          background-color: rgba(0, 0, 0, 0.15);
          border: 1px solid color-mix(in srgb, var(--accent-primary) 20%, transparent);
          border-radius: 0.75em;
          padding: 1.25em;
          margin: 1.5em 0;
          overflow-x: auto;
        }

        .ProseMirror pre code {
          background: none;
          padding: 0;
          font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
          font-size: 0.9em;
          color: inherit;
        }

        .ProseMirror blockquote {
          border-left: 4px solid var(--accent-secondary);
          background-color: color-mix(in srgb, var(--accent-primary) 5%, transparent);
          padding: 1em 1.25em;
          margin: 1.5em 0;
          font-style: italic;
          border-radius: 0 0.5em 0.5em 0;
        }

        .ProseMirror a {
          color: var(--accent-secondary);
          text-decoration: underline;
          text-decoration-color: color-mix(in srgb, var(--accent-secondary) 40%, transparent);
          text-underline-offset: 2px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .ProseMirror a:hover {
          color: var(--accent-primary);
          text-decoration-color: var(--accent-primary);
        }

        .ProseMirror strong {
          font-weight: 700;
        }

        .ProseMirror em {
          font-style: italic;
        }

        .ProseMirror u {
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .ProseMirror s {
          text-decoration: line-through;
        }

        /* Dark mode adjustments */
        @media (prefers-color-scheme: dark) {
          .ProseMirror code {
            background-color: color-mix(in srgb, var(--accent-primary) 25%, transparent);
          }

          .ProseMirror pre {
            background-color: rgba(255, 255, 255, 0.05);
          }

          .ProseMirror blockquote {
            background-color: color-mix(in srgb, var(--accent-primary) 10%, transparent);
          }
        }
      `}</style>
    </div>
  );
};
