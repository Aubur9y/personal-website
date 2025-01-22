import { marked } from 'marked';
import 'highlight.js/styles/github-dark.css';
import rehypeHighlight from 'rehype-highlight';

marked.setOptions({
  breaks: true,
  gfm: true,
  highlight: function (code, lang) {
    const hljs = require('highlight.js');
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
});

export default function MarkdownContent({ content }) {
  return (
    <div 
      className="prose prose-lg max-w-none dark:prose-invert"
      dangerouslySetInnerHTML={{ 
        __html: marked(content || '') 
      }} 
    />
  );
} 