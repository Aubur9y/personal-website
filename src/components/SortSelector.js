import { useLanguage } from '../contexts/LanguageContext';

export default function SortSelector({ value, onChange }) {
  const { translations } = useLanguage();
  
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 border rounded-md bg-white"
    >
      <option value="newest">{translations.blog.sort.latest}</option>
      <option value="oldest">{translations.blog.sort.oldest}</option>
      <option value="popular">{translations.blog.sort.popular}</option>
    </select>
  );
} 