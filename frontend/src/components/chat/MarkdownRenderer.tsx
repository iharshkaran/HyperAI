import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyButton } from '../common/CopyButton';

interface MarkdownRendererProps {
    content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');
                    const language = match ? match[1] : '';

                    return !inline && match ? (
                        <div className="my-4 rounded-xl overflow-hidden border border-(--border) bg-[#1e1e1e] text-zinc-100 shadow-xs">
                            <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] text-xs text-zinc-400 font-mono border-b border-zinc-700">
                                <span className="font-semibold text-white">{language}</span>
                                <CopyButton text={codeString} />
                            </div>
                            <SyntaxHighlighter
                                style={vscDarkPlus as any}
                                language={language}
                                PreTag="div"
                                className="my-0! bg-transparent! p-4 text-sm font-mono overflow-x-auto leading-relaxed"
                                {...props}
                            >
                                {codeString}
                            </SyntaxHighlighter>
                        </div>
                    ) : (
                        <code
                            className="bg-(--card) text-(--text1) px-1.5 py-0.5 rounded text-xs font-mono border border-(--border)"
                            {...props}
                        >
                            {children}
                        </code>
                    );
                },
                table: ({ children }) => (
                    <div className="my-4 overflow-x-auto rounded-xl border border-(--border) bg-(--card)/50 shadow-xs">
                        <table className="w-full text-left border-collapse text-sm text-(--text1)">
                            {children}
                        </table>
                    </div>
                ),
                thead: ({ children }) => (
                    <thead className="bg-(--box) border-b border-(--border) font-semibold text-(--text1)">
                        {children}
                    </thead>
                ),
                th: ({ children }) => (
                    <th className="px-4 py-3 border-r border-(--border) last:border-r-0 text-xs uppercase tracking-wider font-bold">
                        {children}
                    </th>
                ),
                td: ({ children }) => (
                    <td className="px-4 py-2.5 border-t border-r border-(--border)/60 last:border-r-0 text-sm">
                        {children}
                    </td>
                ),
                hr: () => <hr className="my-6 border-t border-(--border)" />,
                p: ({ children }) => (
                    <p className="mb-4 last:mb-0 text-base leading-relaxed text-(--text1)">
                        {children}
                    </p>
                ),
                ul: ({ children }) => (
                    <ul className="list-disc ml-5 mb-3 space-y-1 text-(--text1)">
                        {children}
                    </ul>
                ),
                ol: ({ children }) => (
                    <ol className="list-decimal ml-5 mb-3 space-y-1 text-(--text1)">
                        {children}
                    </ol>
                ),
                h1: ({ children }) => (
                    <h1 className="text-xl font-bold my-3 text-(--text1)">{children}</h1>
                ),
                h2: ({ children }) => (
                    <h2 className="text-lg font-bold my-2 text-(--text1)">{children}</h2>
                ),
            }}
        >
            {content}
        </ReactMarkdown>
    );
};