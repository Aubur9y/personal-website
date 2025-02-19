import { useState, useEffect } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

// 配置 marked
marked.setOptions({
  highlight: function(code, lang) {
    if (!lang) return code;
    try {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    } catch (err) {
      console.error('Highlight error:', err);
      return code;
    }
  },
  langPrefix: 'hljs language-',
  gfm: true,
  breaks: true,
  pedantic: false,
  smartLists: true,
  smartypants: true
});

export default function MarkdownEditor({ value, onChange, preview = false }) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    if (value) {
      try {
        setHtml(marked(value));
      } catch (error) {
        console.error('Markdown parsing error:', error);
        setHtml('<p>Error parsing markdown</p>');
      }
    }
  }, [value]);

  if (preview) {
    return (
      <div 
        className="prose prose-lg max-w-none dark:prose-invert prose-pre:bg-gray-800 prose-pre:p-0"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 h-[600px]">
      {/* 编辑器 */}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full p-4 font-mono text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="在这里输入 Markdown 内容..."
        />
      </div>

      {/* 预览 */}
      <div className="border border-gray-300 rounded-md p-4 overflow-auto bg-white">
        <div 
          className="prose prose-lg max-w-none dark:prose-invert prose-pre:bg-gray-800 prose-pre:p-0"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
} 