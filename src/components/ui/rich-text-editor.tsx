import { useEffect, useRef } from 'react';
import { cn } from './utils';

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  disabled?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start typing...',
  className,
  minHeight = '300px',
  disabled = false
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!editorRef.current || isInitialized.current) return;
    
    // Set initial content
    if (value && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
    
    isInitialized.current = true;
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const addLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const toolbarButtons = [
    {
      group: 'Text Formatting',
      buttons: [
        { icon: 'B', command: 'bold', title: 'Bold', style: { fontWeight: 'var(--font-weight-medium)' } },
        { icon: 'I', command: 'italic', title: 'Italic', style: { fontStyle: 'italic' } },
        { icon: 'U', command: 'underline', title: 'Underline', style: { textDecoration: 'underline' } },
        { icon: 'S', command: 'strikeThrough', title: 'Strikethrough', style: { textDecoration: 'line-through' } }
      ]
    },
    {
      group: 'Headings',
      buttons: [
        { icon: 'H1', command: 'formatBlock', value: 'h1', title: 'Heading 1' },
        { icon: 'H2', command: 'formatBlock', value: 'h2', title: 'Heading 2' },
        { icon: 'H3', command: 'formatBlock', value: 'h3', title: 'Heading 3' },
        { icon: 'P', command: 'formatBlock', value: 'p', title: 'Paragraph' }
      ]
    },
    {
      group: 'Lists',
      buttons: [
        { icon: '•', command: 'insertUnorderedList', title: 'Bullet List' },
        { icon: '1.', command: 'insertOrderedList', title: 'Numbered List' }
      ]
    },
    {
      group: 'Alignment',
      buttons: [
        { icon: '⬅', command: 'justifyLeft', title: 'Align Left' },
        { icon: '↔', command: 'justifyCenter', title: 'Align Center' },
        { icon: '➡', command: 'justifyRight', title: 'Align Right' }
      ]
    },
    {
      group: 'Insert',
      buttons: [
        { icon: '🔗', command: 'custom', action: addLink, title: 'Insert Link' },
        { icon: '🖼', command: 'custom', action: insertImage, title: 'Insert Image' },
        { icon: '—', command: 'insertHorizontalRule', title: 'Horizontal Rule' }
      ]
    },
    {
      group: 'Actions',
      buttons: [
        { icon: '↶', command: 'undo', title: 'Undo' },
        { icon: '↷', command: 'redo', title: 'Redo' },
        { icon: '✕', command: 'removeFormat', title: 'Clear Formatting' }
      ]
    }
  ];

  return (
    <div
      className={cn('rounded-lg overflow-hidden border', className)}
      style={{
        borderColor: 'var(--color-border-default)',
        backgroundColor: 'var(--color-bg-card)'
      }}
    >
      {/* Toolbar */}
      <div
        className="flex flex-wrap gap-1 border-b"
        style={{
          padding: 'var(--spacing-2)',
          borderColor: 'var(--color-border-default)',
          backgroundColor: 'var(--color-bg-muted)'
        }}
      >
        {toolbarButtons.map((group, groupIdx) => (
          <React.Fragment key={groupIdx}>
            {groupIdx > 0 && (
              <div
                style={{
                  width: '1px',
                  backgroundColor: 'var(--color-border-default)',
                  margin: '0 var(--spacing-1)'
                }}
              />
            )}
            <div className="flex gap-1">
              {group.buttons.map((btn, btnIdx) => (
                <button
                  key={btnIdx}
                  type="button"
                  onClick={() => {
                    if (btn.action) {
                      btn.action();
                    } else if (btn.value) {
                      execCommand(btn.command, btn.value);
                    } else {
                      execCommand(btn.command);
                    }
                  }}
                  disabled={disabled}
                  title={btn.title}
                  className="hover:bg-[var(--color-bg-card)] transition-colors rounded"
                  style={{
                    padding: 'var(--spacing-2)',
                    minWidth: '32px',
                    height: '32px',
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family-base)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    border: 'none',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.5 : 1,
                    ...btn.style
                  }}
                >
                  {btn.icon}
                </button>
              ))}
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        className="focus:outline-none rich-text-editor-content"
        style={{
          minHeight,
          padding: 'var(--spacing-4)',
          fontFamily: 'var(--font-family-base)',
          fontSize: 'var(--text-base)',
          lineHeight: 'var(--line-height-base)',
          color: 'var(--color-text-primary)',
          backgroundColor: 'var(--color-bg-card)',
          overflowY: 'auto'
        }}
        data-placeholder={placeholder}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        .rich-text-editor-content:empty:before {
          content: attr(data-placeholder);
          color: var(--color-text-muted);
          font-style: italic;
        }
        
        .rich-text-editor-content h1 {
          font-size: var(--text-3xl);
          font-weight: var(--font-weight-medium);
          margin-bottom: var(--spacing-4);
        }
        
        .rich-text-editor-content h2 {
          font-size: var(--text-2xl);
          font-weight: var(--font-weight-medium);
          margin-bottom: var(--spacing-3);
        }
        
        .rich-text-editor-content h3 {
          font-size: var(--text-xl);
          font-weight: var(--font-weight-medium);
          margin-bottom: var(--spacing-2);
        }
        
        .rich-text-editor-content p {
          margin-bottom: var(--spacing-3);
        }
        
        .rich-text-editor-content ul,
        .rich-text-editor-content ol {
          margin-left: var(--spacing-6);
          margin-bottom: var(--spacing-3);
        }
        
        .rich-text-editor-content li {
          margin-bottom: var(--spacing-1);
        }
        
        .rich-text-editor-content a {
          color: var(--color-primary-default);
          text-decoration: underline;
        }
        
        .rich-text-editor-content img {
          max-width: 100%;
          height: auto;
          border-radius: var(--radius-md);
          margin: var(--spacing-4) 0;
        }
        
        .rich-text-editor-content hr {
          border: none;
          border-top: 1px solid var(--color-border-default);
          margin: var(--spacing-6) 0;
        }
      ` }} />
    </div>
  );
}