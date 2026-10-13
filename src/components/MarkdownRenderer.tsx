import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Prism from 'prismjs';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-sql';

const LANGUAGE_ALIASES: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  md: 'markdown',
  html: 'markup',
  xml: 'markup',
  svg: 'markup',
};

function isSafeUrl(url?: string): boolean {
  if (!url) return false;
  return /^(https?:\/\/|mailto:|#|\/)/i.test(url.trim());
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API is blocked
    }
  };

  return (
    <button
      type="button"
      className="markdown-copy-btn"
      onClick={handleCopy}
      aria-label="Copy code to clipboard"
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Enterprise-grade Markdown Renderer for E-Cell RCPIT Blog.
 * - Full GitHub Flavored Markdown (GFM) support via remark-gfm.
 * - PrismJS syntax highlighting for code blocks with copy-to-clipboard.
 * - Responsive, mobile-safe tables with horizontal scrolling wrapper.
 * - Safe URL sanitization to prevent XSS.
 * - Styled typography honoring the existing E-Cell visual system.
 */
export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const rendered = useMemo(() => {
    if (!content) return null;

    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ children }) => <h1 className="markdown-h1">{children}</h1>,
          h2: ({ children }) => <h2 className="markdown-h2">{children}</h2>,
          h3: ({ children }) => <h3 className="markdown-h3">{children}</h3>,
          h4: ({ children }) => <h4 className="markdown-h4">{children}</h4>,
          h5: ({ children }) => <h5 className="markdown-h5">{children}</h5>,
          h6: ({ children }) => <h6 className="markdown-h6">{children}</h6>,

          // Paragraphs
          p: ({ children }) => <p className="markdown-p">{children}</p>,

          // Links with strict protocol sanitization
          a: ({ href, children, ...props }) => {
            const safe = isSafeUrl(href);
            const validHref = safe && href ? href : '#';
            const isExternal = validHref.startsWith('http://') || validHref.startsWith('https://');

            return (
              <a
                href={validHref}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="markdown-link"
                {...props}
              >
                {children}
              </a>
            );
          },

          // Images with strict protocol validation
          img: ({ src, alt, ...props }) => {
            const safe = isSafeUrl(src);
            if (!safe || !src) return null;

            return (
              <img
                src={src}
                alt={alt || ''}
                className="markdown-image"
                loading="lazy"
                decoding="async"
                {...props}
              />
            );
          },

          // Tables with responsive mobile overflow wrapper
          table: ({ children, ...props }) => (
            <div className="markdown-table-wrapper">
              <table className="markdown-table" {...props}>
                {children}
              </table>
            </div>
          ),

          // Code blocks and inline code
          pre: ({ children }) => <>{children}</>,

          code: ({ className: codeClassName, children, ...props }) => {
            const match = /language-(\w+)/.exec(codeClassName || '');
            const rawLang = match ? match[1].toLowerCase() : '';
            const normalizedLang = LANGUAGE_ALIASES[rawLang] || rawLang;
            const codeString = String(children || '').replace(/\n$/, '');

            const isBlock = Boolean(match) || codeString.includes('\n');

            if (isBlock) {
              const grammar = Prism.languages[normalizedLang];
              const highlighted = grammar
                ? Prism.highlight(codeString, grammar, normalizedLang)
                : null;

              return (
                <div className="markdown-code-block">
                  <div className="markdown-code-header">
                    <span className="markdown-code-lang">{rawLang || 'code'}</span>
                    <CopyButton code={codeString} />
                  </div>
                  <pre className="markdown-pre">
                    <code
                      className={codeClassName}
                      dangerouslySetInnerHTML={
                        highlighted ? { __html: highlighted } : undefined
                      }
                      {...props}
                    >
                      {!highlighted ? codeString : undefined}
                    </code>
                  </pre>
                </div>
              );
            }

            return (
              <code className="markdown-inline-code" {...props}>
                {children}
              </code>
            );
          },

          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="markdown-blockquote">{children}</blockquote>
          ),

          // Lists
          ul: ({ children, ...props }) => (
            <ul className="markdown-ul" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="markdown-ol" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="markdown-li" {...props}>
              {children}
            </li>
          ),

          // Horizontal rule
          hr: () => <hr className="markdown-hr" />,
        }}
      >
        {content}
      </ReactMarkdown>
    );
  }, [content]);

  return <div className={`markdown-body ${className}`.trim()}>{rendered}</div>;
}
