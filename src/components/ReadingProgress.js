import { useState, useEffect } from 'react';

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const article = document.querySelector('article');
      if (!article) return;

      const totalHeight = article.clientHeight;
      const windowHeight = window.innerHeight;
      const position = window.scrollY;
      const offset = article.offsetTop;
      const height = totalHeight - windowHeight;
      const calculated = ((position - offset) / height) * 100;
      const progress = Math.min(100, Math.max(0, calculated));
      
      setProgress(progress);
    };

    window.addEventListener('scroll', updateProgress);
    updateProgress();

    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
      <div
        className="h-full bg-blue-600 transition-all duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
} 