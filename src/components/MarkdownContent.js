import { useEffect } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

export default function MarkdownContent({ content }) {
  useEffect(() => {
    hljs.highlightAll();
  }, [content]);

  // 处理 Markdown 内容
  const processContent = (content) => {
    // 为标题添加 ID，以支持目录导航
    const lines = content.split('\n').map(line => {
      if (line.startsWith('#')) {
        const level = line.match(/^#+/)[0].length;
        const text = line.replace(/^#+\s+/, '');
        const id = text.toLowerCase().replace(/\s+/g, '-');
        return `${'#'.repeat(level)} ${text} {#${id}}`;
      }
      return line;
    });

    // 处理代码块
    const processedLines = lines.map(line => {
      if (line.startsWith('```')) {
        return line.replace('```', '```language-');
      }
      return line;
    });

    return processedLines.join('\n');
  };

  return (
    <article className="prose prose-lg max-w-none mb-8">
      {processContent(content).split('\n').map((line, index) => {
        // 处理代码块
        if (line.startsWith('```')) {
          const language = line.split('```language-')[1];
          return (
            <pre key={index} className={`language-${language}`}>
              <code className={`language-${language}`}>
                {/* 代码内容会在下一行 */}
              </code>
            </pre>
          );
        }
        
        // 处理标题
        if (line.startsWith('#')) {
          const level = line.match(/^#+/)[0].length;
          const text = line.replace(/^#+\s+/, '').replace(/\s+{#.+}$/, '');
          const id = text.toLowerCase().replace(/\s+/g, '-');
          const HeadingTag = `h${level}`;
          return <HeadingTag key={index} id={id}>{text}</HeadingTag>;
        }
        
        // 普通段落
        return <p key={index}>{line}</p>;
      })}
    </article>
  );
} 