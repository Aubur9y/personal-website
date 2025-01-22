import { useLanguage } from '../contexts/LanguageContext';

export default function CategoryFilter({ categories, selected, onChange }) {
  const { translations } = useLanguage();
  
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map(category => (
        <button
          key={category}
          onClick={() => onChange(category)}
          className={`px-3 py-1 rounded-full text-sm ${
            selected === category
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {translations.blog.filters[category.toLowerCase()] || category}
        </button>
      ))}
    </div>
  );
} 