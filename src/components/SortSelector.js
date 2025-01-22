export default function SortSelector({ value, onChange }) {
  const sortOptions = [
    { value: 'newest', label: '最新发布' },
    { value: 'oldest', label: '最早发布' },
    { value: 'readTime', label: '阅读时间' }
  ];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 cursor-pointer"
    >
      {sortOptions.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
} 