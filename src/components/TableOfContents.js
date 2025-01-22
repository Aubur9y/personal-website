import { useState, useEffect } from 'react';

export default function TableOfContents() {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    // 获取所有标题元素
    const elements = Array.from(document.querySelectorAll('h1, h2, h3'))
      .map(element => ({
        id: element.id,
        text: element.textContent,
        level: Number(element.tagName.charAt(1)),
      }));
    setHeadings(elements);

    // 监听滚动，高亮当前标题
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0px 0px -80% 0px' }
    );

    elements.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      elements.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, []);

  return (
    <nav className="hidden lg:block sticky top-8 max-h-[calc(100vh-4rem)] overflow-auto">
      <h2 className="text-lg font-semibold mb-4">目录</h2>
      <ul className="space-y-2">
        {headings.map(({ id, text, level }) => (
          <li
            key={id}
            style={{ paddingLeft: `${(level - 1) * 1}rem` }}
          >
            <a
              href={`#${id}`}
              className={`block py-1 text-sm hover:text-blue-600 transition-colors ${
                activeId === id
                  ? 'text-blue-600 font-medium'
                  : 'text-gray-600'
              }`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(id)?.scrollIntoView({
                  behavior: 'smooth',
                });
              }}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
} 